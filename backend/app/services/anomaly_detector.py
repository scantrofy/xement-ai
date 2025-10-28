from google.cloud import bigquery
from datetime import datetime, timedelta
from app.routers.config_router import DEFAULT_THRESHOLDS
from app.services.firestore_service import fs_client
from app.services.email_service import send_anomaly_alert_email
import logging

logger = logging.getLogger(__name__)

def check_anomalies_with_thresholds(state: dict, thresholds: dict = None):
    """
    Detect anomalies in plant operation state with comprehensive checks.
    Returns anomalies categorized by severity.
    """
    if thresholds is None:
        thresholds = DEFAULT_THRESHOLDS
    
    critical_anomalies = []
    warning_anomalies = []
    
    # Grinding efficiency checks
    grinding_eff = state.get("grinding_efficiency", 100)
    ge_thresholds = thresholds.get("grinding_efficiency", {})
    if grinding_eff < ge_thresholds.get("critical_min", 82):
        critical_anomalies.append("low_grinding_efficiency")
    elif grinding_eff < ge_thresholds.get("warning_min", 88):
        warning_anomalies.append("suboptimal_grinding_efficiency")
    
    # Kiln temperature checks
    kiln_temp = state.get("kiln_temp", 0)
    kt_thresholds = thresholds.get("kiln_temp", {})
    if kiln_temp > kt_thresholds.get("critical_max", 1500):
        critical_anomalies.append("high_kiln_temp")
    elif kiln_temp > kt_thresholds.get("warning_max", 1480):
        warning_anomalies.append("elevated_kiln_temp")
    elif kiln_temp < kt_thresholds.get("warning_min", 1400):
        warning_anomalies.append("low_kiln_temp")
    
    # Energy consumption checks
    energy_use = state.get("energy_use", 0)
    eu_thresholds = thresholds.get("energy_use", {})
    if energy_use > eu_thresholds.get("critical_max", 170):
        critical_anomalies.append("high_energy_consumption")
    elif energy_use > eu_thresholds.get("warning_max", 160):
        warning_anomalies.append("elevated_energy_consumption")
    
    # Emissions checks
    emissions = state.get("emissions_CO2", 0)
    em_thresholds = thresholds.get("emissions_CO2", {})
    if emissions > em_thresholds.get("critical_max", 120):
        critical_anomalies.append("high_emissions")
    elif emissions > em_thresholds.get("warning_max", 110):
        warning_anomalies.append("elevated_emissions")
    
    # Product quality checks
    quality = state.get("product_quality_index", 100)
    pq_thresholds = thresholds.get("product_quality_index", {})
    if quality < pq_thresholds.get("critical_min", 75):
        critical_anomalies.append("low_product_quality")
    elif quality < pq_thresholds.get("warning_min", 80):
        warning_anomalies.append("suboptimal_product_quality")
    
    # Fan speed checks
    fan_speed = state.get("fan_speed", 0)
    fs_thresholds = thresholds.get("fan_speed", {})
    if fan_speed > fs_thresholds.get("warning_max", 85):
        warning_anomalies.append("high_fan_speed")
    elif fan_speed < fs_thresholds.get("warning_min", 65):
        warning_anomalies.append("low_fan_speed")
    
    # Feed rate checks
    feed_rate = state.get("feed_rate", 0)
    fr_thresholds = thresholds.get("feed_rate", {})
    if feed_rate > fr_thresholds.get("warning_max", 120):
        warning_anomalies.append("high_feed_rate")
    elif feed_rate < fr_thresholds.get("warning_min", 90):
        warning_anomalies.append("low_feed_rate")
    
    all_anomalies = critical_anomalies + warning_anomalies
    
    return {
        "anomaly_flag": bool(all_anomalies),
        "anomalies": all_anomalies,
        "critical_anomalies": critical_anomalies,
        "warning_anomalies": warning_anomalies,
        "severity": "critical" if critical_anomalies else ("warning" if warning_anomalies else "normal")
    }


def run_scheduled_anomaly_detection():
    """
    Scheduled function to check for anomalies and send alerts.
    Should be called every 10 minutes by Cloud Scheduler.
    """
    try:
        logger.info("Starting scheduled anomaly detection...")
        
        # Fetch latest state from BigQuery
        bq_client = bigquery.Client()
        query = """
            SELECT *
            FROM `xement-ai.xement_ai_dataset.serve_latest`
            ORDER BY timestamp DESC
            LIMIT 1
        """
        
        result = bq_client.query(query).result()
        rows = list(result)
        
        if not rows:
            logger.warning("No data found in BigQuery for anomaly detection")
            return {"success": False, "message": "No data available"}
        
        latest_state = dict(rows[0])
        logger.info(f"Fetched latest state: {latest_state.get('timestamp')}")
        logger.info(f"Plant state values - energy_use: {latest_state.get('energy_use')}, grinding_efficiency: {latest_state.get('grinding_efficiency')}, kiln_temp: {latest_state.get('kiln_temp')}, product_quality_index: {latest_state.get('product_quality_index')}")
        
        # Check for anomalies
        anomaly_result = check_anomalies_with_thresholds(latest_state)
        logger.info(f"Anomaly check result: {anomaly_result}")
        
        if anomaly_result["anomaly_flag"]:
            logger.info(f"Anomalies detected: {anomaly_result['severity']} - {len(anomaly_result['anomalies'])} anomalies")
            
            # Store alert in Firestore
            alert_data = {
                "timestamp": datetime.utcnow(),
                "severity": anomaly_result["severity"],
                "anomalies": anomaly_result["anomalies"],
                "critical_anomalies": anomaly_result["critical_anomalies"],
                "warning_anomalies": anomaly_result["warning_anomalies"],
                "plant_state": latest_state,
                "notified": True,
                "acknowledged": False
            }
            
            # Save to Firestore
            alert_ref = fs_client.collection("alerts").add(alert_data)
            logger.info(f"Alert saved to Firestore: {alert_ref[1].id}")
            
            # Send email notifications
            send_anomaly_alert_email(
                anomalies=anomaly_result["anomalies"],
                severity=anomaly_result["severity"],
                plant_state=latest_state
            )
            
            return {
                "success": True,
                "anomaly_detected": True,
                "severity": anomaly_result["severity"],
                "anomalies": anomaly_result["anomalies"],
                "alert_id": alert_ref[1].id
            }
        else:
            logger.info("No anomalies detected in scheduled check")
            return {
                "success": True,
                "anomaly_detected": False,
                "message": "All systems normal"
            }
    
    except Exception as e:
        logger.error(f"Error in scheduled anomaly detection: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}


def get_recent_alerts(limit: int = 50, severity: str = None):
    """Fetch recent alerts from Firestore."""
    try:
        query = fs_client.collection("alerts").order_by("timestamp", direction="DESCENDING").limit(limit)
        
        if severity:
            query = query.where("severity", "==", severity)
        
        alerts = []
        for doc in query.stream():
            alert_data = doc.to_dict()
            alert_data["id"] = doc.id
            # Convert timestamp to ISO string
            if "timestamp" in alert_data:
                alert_data["timestamp"] = alert_data["timestamp"].isoformat()
            alerts.append(alert_data)
        
        return alerts
    
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        return []


def acknowledge_alert(alert_id: str, acknowledged_by: str):
    """Mark an alert as acknowledged."""
    try:
        alert_ref = fs_client.collection("alerts").document(alert_id)
        alert_ref.update({
            "acknowledged": True,
            "acknowledged_by": acknowledged_by,
            "acknowledged_at": datetime.utcnow()
        })
        return {"success": True, "message": "Alert acknowledged"}
    except Exception as e:
        logger.error(f"Error acknowledging alert: {str(e)}")
        return {"success": False, "error": str(e)}
