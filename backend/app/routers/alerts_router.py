from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.middleware.auth import require_auth
from app.services.anomaly_detector import (
    run_scheduled_anomaly_detection,
    get_recent_alerts,
    acknowledge_alert
)
from app.services.email_service import send_test_email
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/alerts", tags=["Alerts"])


class AcknowledgeAlertRequest(BaseModel):
    alert_id: str
    acknowledged_by: str


class TestEmailRequest(BaseModel):
    recipient: str


@router.get("/recent")
def get_alerts(
    limit: int = 50,
    severity: Optional[str] = None,
    user=Depends(require_auth)
):
    """
    Get recent alerts from Firestore.
    
    Query Parameters:
    - limit: Number of alerts to fetch (default: 50)
    - severity: Filter by severity ('critical', 'warning', or None for all)
    """
    try:
        alerts = get_recent_alerts(limit=limit, severity=severity)
        return {
            "success": True,
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/acknowledge")
def acknowledge(
    request: AcknowledgeAlertRequest,
    user=Depends(require_auth)
):
    """
    Mark an alert as acknowledged.
    """
    result = acknowledge_alert(request.alert_id, request.acknowledged_by)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result


@router.post("/check-now")
def check_anomalies_now(
    background_tasks: BackgroundTasks,
    user=Depends(require_auth)
):
    """
    Manually trigger anomaly detection (same as scheduled check).
    Runs in background to avoid blocking.
    """
    background_tasks.add_task(run_scheduled_anomaly_detection)
    return {
        "success": True,
        "message": "Anomaly detection started in background"
    }


@router.post("/scheduled-check")
def scheduled_check():
    """
    Endpoint for Cloud Scheduler to trigger periodic anomaly detection.
    This should be called every 10 minutes by Cloud Scheduler.
    
    Note: This endpoint should be secured with Cloud Scheduler authentication
    or a secret token in production.
    """
    result = run_scheduled_anomaly_detection()
    return result


@router.post("/test-email")
def test_email(
    request: TestEmailRequest,
    user=Depends(require_auth)
):
    """
    Send a test email to verify email configuration.
    """
    result = send_test_email(request.recipient)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return result
