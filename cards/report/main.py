import modal
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from jinja2 import Template


app = modal.App("report-output")
image = (
    modal.Image.debian_slim()
    .pip_install("supabase", "fastapi", "jinja2", "mailjet-rest")
    .add_local_file("template.txt", remote_path="/root/template.txt")
    .add_local_file("email_template.txt", remote_path="/root/email_template.txt")
    .add_local_file("email_template.html", remote_path="/root/email_template.html")
)
web_app = FastAPI()

TEMPLATE_PATH = Path("/root/template.txt")
EMAIL_TEXT_PATH = Path("/root/email_template.txt")
EMAIL_HTML_PATH = Path("/root/email_template.html")


class LeadRecord(BaseModel):
    name: str
    email: EmailStr
    lid: str

    class Config:
        extra = "ignore"  # Ignore other fields from the leads table


class SupabaseWebhookPayload(BaseModel):
    type: str
    table: str
    record: LeadRecord
    schema_: str | None = None
    old_record: dict | None = None

    class Config:
        extra = "ignore"
        populate_by_name = True


@web_app.post("/send-confirmation")
def send_confirmation(payload: SupabaseWebhookPayload):
    """Send confirmation email with personalized report link.

    Triggered by Supabase database webhook on INSERT to leads table.
    """
    from mailjet_rest import Client

    record = payload.record

    api_key = os.environ["MAILJET_API_KEY"]
    api_secret = os.environ["MAILJET_API_SECRET"]
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')

    report_url = f"https://longreach.ai/cards/report/{record.lid}"
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

    if result.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"success": True}


@web_app.get("/report/{lid}")
def get_report(lid: str):
    print(f"get_report({lid})")
    return get_lead(lid)


def get_lead(lid: str) -> dict:
    from supabase import create_client

    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    client = create_client(supabase_url, supabase_key)
    response = client.table("leads").select("*").eq("lid", lid).maybe_single().execute()

    if not response or not response.data:
        return {"success": False, "error": "Lead not found"}

    template = Template(TEMPLATE_PATH.read_text())
    return {"success": True, "report": template.render(response.data)}


@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("supabase-credentials"),
        modal.Secret.from_name("mailjet-credentials"),
    ],
)
@modal.asgi_app()
def fastapi_app():
    return web_app
