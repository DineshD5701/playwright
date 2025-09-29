#GMAIL-Integration
import os, smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

SENDER_EMAIL = os.getenv("EMAIL_USER")
PASSWORD = os.getenv("EMAIL_PASS")
RECEIVER_EMAIL = "dinesh.d@kapturecrm.com"

# Attach HTML
filename = "allure-report/index.html"
with open(filename, "r") as f:
    html_content = f.read()

msg = MIMEMultipart()
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL
msg["Subject"] = "Playwright Allure Report"

# Add HTML as body
msg.attach(MIMEText(html_content, "html"))

# Also attach as file
with open(filename, "rb") as f:
    part = MIMEBase("application", "octet-stream")
    part.set_payload(f.read())
encoders.encode_base64(part)
part.add_header("Content-Disposition", f"attachment; filename=index.html")
msg.attach(part)

context = ssl.create_default_context()
with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
    server.login(SENDER_EMAIL, PASSWORD)
    server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())

print("✅ Allure report sent via email")




#GCHAT Webhook Integration
import os, requests

GCHAT_WEBHOOK = os.getenv("GCHAT_WEBHOOK")
with open("allure-report/index.html", "r") as f:
    html_content = f.read()

# Google Chat card with HTML content
payload = {
    "text": "Playwright Allure Report",
    "cards": [
        {
            "header": {"title": "Allure Report"},
            "sections": [
                {"widgets": [{"textParagraph": {"text": html_content}}]}
            ],
        }
    ],
}

requests.post(GCHAT_WEBHOOK, json=payload)
print("✅ Allure report sent to Google Chat")
