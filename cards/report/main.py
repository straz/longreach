import modal
import os
from pathlib import Path
from fastapi import FastAPI
from jinja2 import Template


app = modal.App("report-output")
image = (
    modal.Image.debian_slim()
    .pip_install("supabase", "fastapi", "jinja2")
    .add_local_file("template.txt", remote_path="/root/template.txt")
)
web_app = FastAPI()

TEMPLATE_PATH = Path("/root/template.txt")


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
    secrets=[modal.Secret.from_name("supabase-credentials")],
)
@modal.asgi_app()
def fastapi_app():
    return web_app
