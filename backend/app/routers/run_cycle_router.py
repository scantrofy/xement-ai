from fastapi import APIRouter, Depends, HTTPException
from google.cloud import bigquery
from datetime import datetime
from app.models.plant_model import PlantState
from app.services.firestore_service import fs_client
from app.services.gemini_service import get_recommendation
from app.services.energy_verify import verify_energy_saving
from app.middleware.auth import require_auth
from app.routers.config_router import DEFAULT_THRESHOLDS

router = APIRouter(prefix="/run_cycle", tags=["Operations"])

def check_anomalies(state: dict, thresholds: dict = None):
    """
    Detect anomalies in plant operation state with comprehensive checks.
    Uses dynamic thresholds from config or falls back to defaults.
    """
    if thresholds is None:
        thresholds = DEFAULT_THRESHOLDS
    
    anomalies = []
    
    # Grinding efficiency checks
    grinding_eff = state.get("grinding_efficiency", 100)
    ge_thresholds = thresholds.get("grinding_efficiency", {})
    if grinding_eff < ge_thresholds.get("critical_min", 82):
        anomalies.append("low_grinding_efficiency")
    elif grinding_eff < ge_thresholds.get("warning_min", 88):
        anomalies.append("suboptimal_grinding_efficiency")
    
    # Kiln temperature checks
    kiln_temp = state.get("kiln_temp", 0)
    kt_thresholds = thresholds.get("kiln_temp", {})
    if kiln_temp > kt_thresholds.get("critical_max", 1500):
        anomalies.append("high_kiln_temp")
    elif kiln_temp > kt_thresholds.get("warning_max", 1480):
        anomalies.append("elevated_kiln_temp")
    elif kiln_temp < kt_thresholds.get("warning_min", 1400):
        anomalies.append("low_kiln_temp")
    
    # Energy consumption checks
    energy_use = state.get("energy_use", 0)
    eu_thresholds = thresholds.get("energy_use", {})
    if energy_use > eu_thresholds.get("critical_max", 170):
        anomalies.append("high_energy_consumption")
    elif energy_use > eu_thresholds.get("warning_max", 160):
        anomalies.append("elevated_energy_consumption")
    
    # Emissions checks
    emissions = state.get("emissions_CO2", 0)
    em_thresholds = thresholds.get("emissions_CO2", {})
    if emissions > em_thresholds.get("critical_max", 120):
        anomalies.append("high_emissions")
    elif emissions > em_thresholds.get("warning_max", 110):
        anomalies.append("elevated_emissions")
    
    # Product quality checks
    quality = state.get("product_quality_index", 100)
    pq_thresholds = thresholds.get("product_quality_index", {})
    if quality < pq_thresholds.get("critical_min", 75):
        anomalies.append("low_product_quality")
    elif quality < pq_thresholds.get("warning_min", 80):
        anomalies.append("suboptimal_product_quality")
    
    # Fan speed checks
    fan_speed = state.get("fan_speed", 0)
    fs_thresholds = thresholds.get("fan_speed", {})
    if fan_speed > fs_thresholds.get("warning_max", 85):
        anomalies.append("high_fan_speed")
    elif fan_speed < fs_thresholds.get("warning_min", 65):
        anomalies.append("low_fan_speed")
    
    # Feed rate checks
    feed_rate = state.get("feed_rate", 0)
    fr_thresholds = thresholds.get("feed_rate", {})
    if feed_rate > fr_thresholds.get("warning_max", 120):
        anomalies.append("high_feed_rate")
    elif feed_rate < fr_thresholds.get("warning_min", 90):
        anomalies.append("low_feed_rate")
    
    return {"anomaly_flag": bool(anomalies), "anomalies": anomalies}

@router.post("/")
def run_cycle(user=Depends(require_auth)):
    """
    Executes a full optimization cycle:
    1. Fetch latest state from BigQuery
    2. Detect anomalies
    3. Generate AI recommendations
    4. Verify energy savings
    5. Log results in Firestore
    """

    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `xement-ai.xement_ai_dataset.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """

    try:
        rows = list(client.query(query))
        if not rows:
            raise HTTPException(status_code=404, detail="No plant state available")
        state = PlantState(**dict(rows[0])).dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BigQuery fetch failed: {str(e)}")

    anomaly = check_anomalies(state)

    try:
        gemini_output = get_recommendation(state)
        if not isinstance(gemini_output, dict):
            gemini_output = {"recommendations": []}
    except Exception as e:
        gemini_output = {"recommendations": [], "error": f"Gemini call failed: {str(e)}"}

    vertex_input_modified = state.copy()
    for rec in gemini_output.get("recommendations", []):
        vertex_input_modified[rec.get("parameter")] = rec.get("new_value")

    try:
        verified_saving = verify_energy_saving(state, vertex_input_modified)
    except Exception:
        verified_saving = None

    gemini_output["verified_saving_pct"] = verified_saving

    try:
        doc_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_email": user["email"], 
            "state": state,
            "anomaly": anomaly,
            "recommendation": gemini_output,
        }
        fs_client.collection("plant_cycles").add(doc_data)
        firestore_written = True
    except Exception as e:
        firestore_written = False
        gemini_output["firestore_error"] = str(e)

    return {
        "status": "success",
        "triggered_by": user["email"],
        "anomaly": anomaly,
        "recommendation": gemini_output,
        "firestore_doc": firestore_written,
    }
