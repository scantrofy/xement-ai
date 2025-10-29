import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict
import logging
from google.cloud import firestore

logger = logging.getLogger(__name__)

# Initialize Firestore client
fs_client = firestore.Client()

# Email configuration from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")  # Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # App password
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)


def get_users_by_role(role: str) -> List[str]:
    """
    Fetch user emails from Firestore by role.
    
    Args:
        role: User role ('admin' or 'operator')
    
    Returns:
        List of email addresses for users with the specified role
    """
    try:
        users_ref = fs_client.collection("users")
        query = users_ref.where("role", "==", role).where("emailNotifications", "==", True)
        users = query.stream()
        
        emails = []
        for user in users:
            user_data = user.to_dict()
            email = user_data.get("email")
            if email:
                emails.append(email)
        
        logger.info(f"Found {len(emails)} {role} users with email notifications enabled")
        return emails
    except Exception as e:
        logger.error(f"Error fetching {role} emails from Firestore: {str(e)}")
        # Fallback to environment variables if Firestore query fails
        env_emails = os.getenv(f"{role.upper()}_EMAILS", "").split(",")
        return [email.strip() for email in env_emails if email.strip()]

def send_anomaly_alert_email(
    anomalies: List[str],
    severity: str,
    plant_state: Dict,
    recipients: List[str] = None
):
    """
    Send email alert for detected anomalies.
    
    Args:
        anomalies: List of anomaly identifiers
        severity: 'critical' or 'warning'
        plant_state: Current plant operational state
        recipients: List of email addresses (defaults to admins/operators based on severity)
    """
    
    # Skip if email not configured
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning(f"Email service not configured. SMTP_USERNAME: {'SET' if SMTP_USERNAME else 'NOT SET'}, SMTP_PASSWORD: {'SET' if SMTP_PASSWORD else 'NOT SET'}. Skipping email notification.")
        return
    
    # Determine recipients based on severity - fetch from Firestore
    if recipients is None:
        if severity == "critical":
            # Critical alerts go to both admins and operators
            admin_emails = get_users_by_role("admin")
            operator_emails = get_users_by_role("operator")
            recipients = admin_emails + operator_emails
        else:  # warning
            # Warning alerts go to operators only
            recipients = get_users_by_role("operator")
    
    if not recipients:
        logger.warning("No recipients found for email alerts. Check Firestore users collection.")
        return
    
    try:
        # Create email message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 {severity.upper()}: Cement Plant Anomaly Detected"
        msg["From"] = FROM_EMAIL
        msg["To"] = ", ".join(recipients)
        
        # Format anomaly list
        anomaly_list = "\n".join([f"  • {format_anomaly_name(a)}" for a in anomalies])
        
        # Create plain text version
        text_content = f"""
CEMENT PLANT ANOMALY ALERT
{'=' * 50}

Severity: {severity.upper()}
Anomalies Detected: {len(anomalies)}

{anomaly_list}

Current Plant State:
  • Energy Use: {plant_state.get('energy_use', 'N/A')} kWh/ton
  • Grinding Efficiency: {plant_state.get('grinding_efficiency', 'N/A')}%
  • Kiln Temperature: {plant_state.get('kiln_temp', 'N/A')}°C
  • Emissions (CO2): {plant_state.get('emissions_CO2', 'N/A')} kg/ton
  • Product Quality: {plant_state.get('product_quality_index', 'N/A')}
  • Fan Speed: {plant_state.get('fan_speed', 'N/A')}%
  • Feed Rate: {plant_state.get('feed_rate', 'N/A')} tons/hr

Action Required:
{'IMMEDIATE ATTENTION REQUIRED - Critical anomalies detected!' if severity == 'critical' else 'Please review and monitor the situation.'}

This is an automated alert from XementAI Monitoring System.
Login to the dashboard for detailed analysis and recommendations.
"""
        
        # Create HTML version
        html_content = f"""
<html>
  <head>
    <style>
      body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
      .header {{ background-color: {'#dc2626' if severity == 'critical' else '#f59e0b'}; color: white; padding: 20px; text-align: center; }}
      .content {{ padding: 20px; }}
      .anomaly-list {{ background-color: #f3f4f6; padding: 15px; border-left: 4px solid {'#dc2626' if severity == 'critical' else '#f59e0b'}; margin: 15px 0; }}
      .state-table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
      .state-table td {{ padding: 8px; border-bottom: 1px solid #e5e7eb; }}
      .state-table td:first-child {{ font-weight: bold; width: 40%; }}
      .footer {{ background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }}
      .action-box {{ background-color: {'#fee2e2' if severity == 'critical' else '#fef3c7'}; border: 2px solid {'#dc2626' if severity == 'critical' else '#f59e0b'}; padding: 15px; margin: 15px 0; border-radius: 5px; }}
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🚨 {severity.upper()}: Cement Plant Anomaly Detected</h1>
    </div>
    
    <div class="content">
      <p><strong>Severity:</strong> <span style="color: {'#dc2626' if severity == 'critical' else '#f59e0b'};">{severity.upper()}</span></p>
      <p><strong>Anomalies Detected:</strong> {len(anomalies)}</p>
      
      <div class="anomaly-list">
        <h3>Detected Anomalies:</h3>
        <ul>
          {''.join([f'<li>{format_anomaly_name(a)}</li>' for a in anomalies])}
        </ul>
      </div>
      
      <h3>Current Plant State:</h3>
      <table class="state-table">
        <tr><td>Energy Use</td><td>{plant_state.get('energy_use', 'N/A')} kWh/ton</td></tr>
        <tr><td>Grinding Efficiency</td><td>{plant_state.get('grinding_efficiency', 'N/A')}%</td></tr>
        <tr><td>Kiln Temperature</td><td>{plant_state.get('kiln_temp', 'N/A')}°C</td></tr>
        <tr><td>Emissions (CO2)</td><td>{plant_state.get('emissions_CO2', 'N/A')} kg/ton</td></tr>
        <tr><td>Product Quality</td><td>{plant_state.get('product_quality_index', 'N/A')}</td></tr>
        <tr><td>Fan Speed</td><td>{plant_state.get('fan_speed', 'N/A')}%</td></tr>
        <tr><td>Feed Rate</td><td>{plant_state.get('feed_rate', 'N/A')} tons/hr</td></tr>
      </table>
      
      <div class="action-box">
        <h3>⚠️ Action Required:</h3>
        <p>{'<strong>IMMEDIATE ATTENTION REQUIRED</strong> - Critical anomalies detected in the production system!' if severity == 'critical' else 'Please review and monitor the situation closely.'}</p>
      </div>
      
      <p>Login to the <a href="{os.getenv('FRONTEND_URL', 'https://your-frontend-url.com')}">XementAI Dashboard</a> for detailed analysis and AI-powered recommendations.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated alert from XementAI Monitoring System.</p>
      <p>© 2025 XementAI - Smart Cement Operations</p>
    </div>
  </body>
</html>
"""
        
        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Anomaly alert email sent to {len(recipients)} recipients: {severity} - {len(anomalies)} anomalies")
        
    except Exception as e:
        logger.error(f"Failed to send anomaly alert email: {str(e)}", exc_info=True)


def format_anomaly_name(anomaly: str) -> str:
    """Format anomaly identifier into human-readable name."""
    return anomaly.replace("_", " ").title()


def send_test_email(recipient: str):
    """Send a test email to verify configuration."""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        return {"success": False, "message": "Email service not configured"}
    
    try:
        msg = MIMEMultipart()
        msg["Subject"] = "XementAI - Email Configuration Test"
        msg["From"] = FROM_EMAIL
        msg["To"] = recipient
        
        body = """
This is a test email from XementAI Monitoring System.

If you received this email, your email configuration is working correctly.

Email alerts will be sent for:
- Critical anomalies (to admins and operators)
- Warning anomalies (to operators)

Best regards,
XementAI Team
"""
        msg.attach(MIMEText(body, "plain"))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        return {"success": True, "message": f"Test email sent to {recipient}"}
    
    except Exception as e:
        logger.error(f"Failed to send test email: {str(e)}")
        return {"success": False, "message": str(e)}
