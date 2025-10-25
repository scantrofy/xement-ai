from fastapi import APIRouter, Depends, HTTPException
from google.cloud import bigquery
from datetime import datetime
from app.models.plant_model import PlantState
from app.services.firestore_service import fs_client
from app.services.gemini_call import get_recommendation
from app.services.energy_verify import verify_energy_saving
from app.middleware.auth import require_auth

router = APIRouter(prefix="/run_cycle", tags=["Operations"])

def check_anomalies(state: dict):
    """Detect anomalies in plant operation state"""
    anomalies = []
    if state.get("grinding_efficiency", 100) < 82:
        anomalies.append("low_grinding_efficiency")
    if state.get("kiln_temp", 0) > 1500:
        anomalies.append("high_kiln_temp")
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
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admin users can run this operation")

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
