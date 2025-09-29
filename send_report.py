import os, smtplib, ssl, json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# Environment variables
SENDER_EMAIL = os.getenv("EMAIL_USER")
PASSWORD = os.getenv("EMAIL_PASS")
RECEIVER_EMAIL = "dinesh.d@kapturecrm.com"

# Path to Allure report summary
SUMMARY_FILE = "allure-report/widgets/summary.json"
HTML_REPORT = "allure-report/index.html"

# Read summary.json
if os.path.exists(SUMMARY_FILE):
    with open(SUMMARY_FILE, "r") as f:
        summary = json.load(f)
else:
    summary = {}
total = summary.get("total", 0)
passed = summary.get("passed", 0)
failed = summary.get("failed", 0)
broken = summary.get("broken", 0)
skipped = summary.get("skipped", 0)

# Create email
msg = MIMEMultipart()
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL
msg["Subject"] = "🚀 Playwright Allure Test Report"

# Construct HTML body
body_html = f"""
<html>
<body>
<h2>🚀 Playwright Test Suite Completed 🚀</h2>
<ul>
<li>🧪 <b>Total:</b> {total}</li>
<li>✅ <b>Passed:</b> {passed}</li>
<li>❌ <b>Failed:</b> {failed}</li>
<li>⚠️ <b>Broken:</b> {broken}</li>
<li>⏭️ <b>Skipped:</b> {skipped}</li>
</ul>
<p>📊 <b>Status:</b> {os.getenv('BUILD_STATUS', 'SUCCESS')}</p>
<p>🔗 <b>Full Report Attached:</b></p>
</body>
</html>
"""

msg.attach(MIMEText(body_html, "html"))

# Attach HTML report
if os.path.exists(HTML_REPORT):
    with open(HTML_REPORT, "rb") as f:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f"attachment; filename=index.html")
    msg.attach(part)

# Send email
context = ssl.create_default_context()
with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
    server.login(SENDER_EMAIL, PASSWORD)
    server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())

print("✅ Allure report email sent successfully!")
