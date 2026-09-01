import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Template
from models import EnrichedCard, InsertLeadNotification, Lead, LeadRecord, ReportResponse, SelectedCard, Taxonomy, TAXONOMY_MODELS, TaxonomyV1
from observations import make_observations

web_app = FastAPI()

web_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://longreach.ai",
        "https://www.longreach.ai",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

REPORT_TEMPLATE_PATH = Path("/root/templates/report_template.md")
EMAIL_TEXT_PATH = Path("/root/templates/email_template.txt")
EMAIL_HTML_PATH = Path("/root/templates/email_template.html")
TAXONOMY_DIR = Path("/root/taxonomy")
MAX_CARDS = 5
MAX_REPORTS_PER_EMAIL = 5

# Leads whose campaign is this come from the "Try us" demo-request form on the
# main site. They carry no cards: skip the report, send a plain thank-you to
# the visitor and a notification to the team.
DEMO_CAMPAIGN = "try-us"
DEMO_NOTIFY_EMAIL = "steve@longreach.ai"
FROM_EMAIL = "info@longrea.ch"
FROM_NAME = "Longreach AI"


def load_taxonomy(version: str) -> Taxonomy:
    """Load a taxonomy file by version string (e.g. '0001')."""
    import yaml
    path = TAXONOMY_DIR / f"{version}.yml"
    if not path.exists():
        raise FileNotFoundError(f"Taxonomy version {version!r} not found")
    model = TAXONOMY_MODELS.get(version, TaxonomyV1)
    with open(path) as f:
        return model.model_validate(yaml.safe_load(f))


def enrich_cards(selected_cards: list[SelectedCard], taxonomy: Taxonomy) -> list[EnrichedCard]:
    """Join selected_cards with full condition data from taxonomy."""
    index = {c.name: c for c in taxonomy.conditions}
    enriched = []
    for card in selected_cards:
        condition = index.get(card.name)
        enriched.append(EnrichedCard(
            id=card.id,
            name=card.name,
            code=condition.code if condition else "",
            category=condition.category if condition else "",
            short_description=condition.short_description if condition else "",
            full_description=condition.full_description if condition else "",
            vectors=condition.vectors if condition else [],
        ))
    return enriched


def check_email_rate_limit(client, email: str, current_lid: str) -> str | None:
    """Check whether this email has exceeded the report limit.

    If within the limit, returns None and takes no action.
    If over the limit, updates the current lead's LID to 'MAX-{lid}' in Supabase
    and returns the most recent prior valid LID to use for the email instead.
    """
    max_marker = 'MAX-'
    response = (
        client.table("leads")
        .select("lid")
        .eq("email", email)
        .order("created_at", desc=True)
        .execute()
    )
    valid_lids = [r["lid"] for r in response.data if not r["lid"].startswith(max_marker)]

    if len(valid_lids) <= MAX_REPORTS_PER_EMAIL:
        return None

    # Mark this lead as over-limit
    client.table("leads").update({"lid": f"{max_marker}{current_lid}"}).eq("lid", current_lid).execute()
    print(f"Rate limit exceeded for {email}: updated lid {current_lid} -> {max_marker}{current_lid}")

    # Return the most recent prior valid LID
    prior_lids = [lid for lid in valid_lids if lid != current_lid]
    return prior_lids[0] if prior_lids else None


def send_mailjet(messages: list[dict]) -> dict:
    """Send one or more Mailjet v3.1 messages. Raise HTTPException on failure."""
    from mailjet_rest import Client

    api_key = os.environ["MAILJET_API_KEY"]
    api_secret = os.environ["MAILJET_API_SECRET"]
    mailjet = Client(auth=(api_key, api_secret), version="v3.1")

    result = mailjet.send.create(data={"Messages": messages})
    print(f"Mailjet response: status={result.status_code}, body={result.json()}")

    if result.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {result.json()}")

    response_data = result.json()
    for msg in response_data.get("Messages", []):
        if msg.get("Status") == "error":
            raise HTTPException(status_code=500, detail=f"Mailjet error: {msg.get('Errors')}")

    return response_data


def send_demo_request_emails(record: LeadRecord) -> dict:
    """Handle a "Try us" demo request: thank the visitor, notify the team.

    No report is generated or linked.
    """
    thank_you = (
        f"Hi {record.name},\n\n"
        "Thanks for asking for a Longreach demo. We have your request and will "
        "be in touch shortly to find a time.\n\n"
        "If you want to add anything in the meantime, just reply to this email.\n\n"
        "— The Longreach team\n"
    )

    notify = "\n".join([
        "New demo request from the Try us form:",
        "",
        f"Name:     {record.name}",
        f"Email:    {record.email}",
        f"Company:  {record.organization or '-'}",
        "",
        "Comments:",
        record.comments or "(none)",
    ])

    subject_org = f" ({record.organization})" if record.organization else ""

    return {
        "success": True,
        "mailjet_response": send_mailjet([
            {
                "From": {"Email": FROM_EMAIL, "Name": FROM_NAME},
                "To": [{"Email": record.email, "Name": record.name}],
                "Subject": "Thanks for your interest in Longreach",
                "TextPart": thank_you,
            },
            {
                "From": {"Email": FROM_EMAIL, "Name": FROM_NAME},
                "To": [{"Email": DEMO_NOTIFY_EMAIL}],
                "ReplyTo": {"Email": record.email, "Name": record.name},
                "Subject": f"Demo request: {record.name}{subject_org}",
                "TextPart": notify,
            },
        ]),
    }


@web_app.post("/send-confirmation")
def send_confirmation(
    payload: InsertLeadNotification,
    x_webhook_secret: str = Header(..., alias="X-Webhook-Secret"),
):
    """Send confirmation email after an INSERT to the leads table.

    Triggered by a Supabase database webhook. Requires X-Webhook-Secret to match
    the WEBHOOK_SECRET env var. Demo requests (campaign == DEMO_CAMPAIGN) get a
    plain thank-you; every other lead gets a personalized report link.
    """
    expected_secret = os.environ.get("WEBHOOK_SECRET")
    if not expected_secret or x_webhook_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")

    record = payload.record

    if record.campaign == DEMO_CAMPAIGN:
        return send_demo_request_emails(record)

    from supabase import create_client

    supabase_client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    report_lid = check_email_rate_limit(supabase_client, record.email, record.lid) or record.lid

    report_url = f"https://longreach.ai/cards/report/{report_lid}"
    template_vars = {"name": record.name, "report_url": report_url}

    text_template = Template(EMAIL_TEXT_PATH.read_text())
    html_template = Template(EMAIL_HTML_PATH.read_text())

    response_data = send_mailjet([
        {
            "From": {"Email": FROM_EMAIL, "Name": FROM_NAME},
            "To": [{"Email": record.email, "Name": record.name}],
            "Subject": "Your AI Risk Assessment Report",
            "TextPart": text_template.render(template_vars),
            "HTMLPart": html_template.render(template_vars),
        }
    ])

    return {"success": True, "mailjet_response": response_data}


@web_app.get("/report/{lid}")
def get_report(lid: str) -> ReportResponse:
    from supabase import create_client

    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    client = create_client(supabase_url, supabase_key)
    response = client.table("leads").select("*").eq("lid", lid).maybe_single().execute()

    if not response or not response.data:
        return ReportResponse(success=False, error="Lead not found")

    lead = Lead.model_validate(response.data)
    version = lead.taxonomy_version or "0001"

    try:
        taxonomy = load_taxonomy(version)
    except FileNotFoundError as e:
        return ReportResponse(success=False, error=str(e))

    enriched_cards = enrich_cards(lead.selected_cards or [], taxonomy)

    template = Template(REPORT_TEMPLATE_PATH.read_text())
    data = {
        **lead.model_dump(),
        "selected_cards": [c.model_dump() for c in enriched_cards],
        "observations": make_observations(lead),
        "MAX_CARDS": MAX_CARDS,
    }
    return ReportResponse(success=True, report=template.render(data))
