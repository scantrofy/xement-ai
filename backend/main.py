from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import bigquery, firestore
from gemini_call import get_recommendation
from energy_verify import verify_energy_saving
from fuel_simulator import simulate_fuel_mix

app = FastAPI()

# Configure CORS - Allow requests from frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://xement-ai.vercel.app",  # Production Vercel domain
        "https://*.vercel.app",           # Any Vercel preview deployments
        "http://localhost:4028",          # Local development (Vite default)
        "http://localhost:3000",          # Alternative local port
        "http://127.0.0.1:4028",         # Local IP variant
        "https://localhost:4028",         # HTTPS local (if used)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
) 

fs_client = firestore.Client(
    project="cement-ops-472217",
    database="recommendations"
)
FIRESTORE_COLLECTION = "recommendations"

class PlantState(BaseModel):
    raw1_frac: float
    raw2_frac: float
    grinding_efficiency: float
    kiln_temp: float
    fan_speed: float
    energy_use: float

@app.get("/")
def root():
    return {"status": "Backend API running"}

@app.get("/latest_state")
def latest_state():
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `cement-ops-472217.cement_ops.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No data found in serve_latest"}
        return dict(rows[0])
    except Exception as e:
        return {"error": f"BigQuery query failed: {str(e)}"}

@app.get("/history")
def history():
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `cement-ops-472217.cement_ops.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 50
    """

    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No data found in serve_latest"}
        return [dict(r) for r in rows]
    except Exception as e:
        return {"error": f"BigQuery query failed: {str(e)}"}

@app.post("/recommendation")
def recommendation(state: PlantState):
    try:
        gemini_output = get_recommendation(state.dict())
        if not isinstance(gemini_output, dict):
            return {"error": "Gemini output not valid JSON"}
    except Exception as e:
        return {"error": f"Gemini call failed: {str(e)}"}

    # Prepare regression inputs
    vertex_input_original = state.dict()
    vertex_input_modified = vertex_input_original.copy()
    for rec in gemini_output.get('recommendations', []):
        try:
            vertex_input_modified[rec['parameter']] = rec['new_value']
        except KeyError:
            continue

    # Verify savings
    try:
        verified_saving = verify_energy_saving(vertex_input_original, vertex_input_modified)
    except Exception:
        verified_saving = None

    gemini_output['verified_saving_pct'] = verified_saving
    return gemini_output

@app.get("/simulate_fuel")
def simulate_fuel():
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `cement-ops-472217.cement_ops.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No plant state available for simulation"}

        # Validate with PlantState model
        state_obj = PlantState(**dict(rows[0]))
        base_row = state_obj.dict()

        # Run simulator with BigQuery latest row
        simulation_results = simulate_fuel_mix(base_row)
        return {"simulation": simulation_results}

    except Exception as e:
        return {"error": f"Fuel simulation failed: {str(e)}"}

def check_anomalies(state_dict):
    anomalies = []
    if state_dict.get("grinding_efficiency", 100) < 82:
        anomalies.append("low_grinding_efficiency")
    if state_dict.get("kiln_temp", 0) > 1500:
        anomalies.append("high_kiln_temp")
    return {"anomaly_flag": len(anomalies) > 0, "anomalies": anomalies}

@app.post("/run_cycle")
def run_cycle():
    # Fetch latest state
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `cement-ops-472217.cement_ops.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No plant state available"}
        state_obj = PlantState(**dict(rows[0]))
        state = state_obj.dict()
    except Exception as e:
        return {"error": f"BigQuery query failed or validation error: {str(e)}"}

    # Run anomaly detection
    anomaly = check_anomalies(state)

    # Get Gemini recommendation
    try:
        gemini_output = get_recommendation(state)
        if not isinstance(gemini_output, dict):
            gemini_output = {"recommendations": []}
    except Exception as e:
        gemini_output = {"recommendations": [], "error": f"Gemini call failed: {str(e)}"}

    # Prepare inputs for energy verification
    vertex_input_original = state
    vertex_input_modified = vertex_input_original.copy()
    for rec in gemini_output.get('recommendations', []):
        try:
            vertex_input_modified[rec['parameter']] = rec['new_value']
        except KeyError:
            continue

    # Verify energy savings
    try:
        verified_saving = verify_energy_saving(vertex_input_original, vertex_input_modified)
    except Exception:
        verified_saving = None

    gemini_output['verified_saving_pct'] = verified_saving

    # Write to Firestore
    try:
        fs_doc = {
            "timestamp": state.get("timestamp"),
            "state": state,
            "anomaly": anomaly,
            "recommendation": gemini_output
        }
        fs_client.collection(FIRESTORE_COLLECTION).add(fs_doc)
        firestore_written = True
    except Exception as e:
        firestore_written = False
        gemini_output["firestore_error"] = str(e)

    # Return everything to UI
    return {
        "state": state,
        "anomaly": anomaly,
        "recommendation": gemini_output,
        "firestore_doc": firestore_written
    }