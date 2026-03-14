import modal
from api import web_app

app = modal.App("report-output")
image = (
    modal.Image.debian_slim(python_version="3.13")
    .run_commands("echo 'image-v2'")
    .pip_install("email-validator", "supabase", "fastapi", "jinja2", "mailjet-rest", "pyyaml")
    .add_local_file("models.py", remote_path="/root/models.py")
    .add_local_file("api.py", remote_path="/root/api.py")
    .add_local_file("observations.py", remote_path="/root/observations.py")
    .add_local_dir("templates", remote_path="/root/templates")
    .add_local_dir("../taxonomy", remote_path="/root/taxonomy")
)


@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("supabase-credentials"),
        modal.Secret.from_name("mailjet-credentials"),
        modal.Secret.from_name("webhook-credentials"),
    ],
)
@modal.asgi_app()
def fastapi_app():
    return web_app
