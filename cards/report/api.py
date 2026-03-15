import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Template
from models import EnrichedCard, InsertLeadNotification, Lead, ReportResponse, SelectedCard, Taxonomy, TAXONOMY_MODELS, TaxonomyV1
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


@web_app.post("/send-confirmation")
def send_confirmation(
    payload: InsertLeadNotification,
    x_webhook_secret: str = Header(..., alias="X-Webhook-Secret"),
):
    """Send confirmation email with personalized report link.

    Triggered by Supabase database webhook on INSERT to leads table.
    Requires X-Webhook-Secret header to match WEBHOOK_SECRET env var.
    """
    expected_secret = os.environ.get("WEBHOOK_SECRET")
    if not expected_secret or x_webhook_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")

    from mailjet_rest import Client
    from supabase import create_client

    record = payload.record

    supabase_client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    report_lid = check_email_rate_limit(supabase_client, record.email, record.lid) or record.lid

    api_key = os.environ["MAILJET_API_KEY"]
    api_secret = os.environ["MAILJET_API_SECRET"]
    print(f"Using Mailjet API key: {api_key[:8]}...")
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')

    report_url = f"https://longreach.ai/cards/report/{report_lid}"
    template_vars = {"name": record.name, "report_url": report_url}

    text_template = Template(EMAIL_TEXT_PATH.read_text())
    html_template = Template(EMAIL_HTML_PATH.read_text())

    data = {
        'Messages': [
            {
                "From": {
                    "Email": "info@longrea.ch",
                    "Name": "Longreach AI"
                },
                "To": [
                    {
                        "Email": record.email,
                        "Name": record.name
                    }
                ],
                "Subject": "Your AI Risk Assessment Report",
                "TextPart": text_template.render(template_vars),
                "HTMLPart": html_template.render(template_vars),
            }
        ]
    }

    result = mailjet.send.create(data=data)

    print(f"Mailjet response: status={result.status_code}, body={result.json()}")

    if result.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {result.json()}")

    response_data = result.json()
    if "Messages" in response_data:
        for msg in response_data["Messages"]:
            if msg.get("Status") == "error":
                raise HTTPException(status_code=500, detail=f"Mailjet error: {msg.get('Errors')}")

    return {"success": True, "mailjet_response": response_data, "api_key_prefix": api_key[:8]}


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
