from fastapi import APIRouter, Depends, HTTPException
from google.cloud import bigquery
from app.models.plant_model import PlantState
from app.services.fuel_simulator import simulate_fuel_mix
from app.middleware.auth import require_auth

router = APIRouter(prefix="/simulate_fuel", tags=["Simulation"])

@router.get("/")
def simulate_fuel(user=Depends(require_auth)):
    try:
        client = bigquery.Client()
        rows = list(client.query("""
            SELECT * FROM `xement-ai.xement_ai_dataset.serve_latest`
            ORDER BY timestamp DESC LIMIT 1
        """))
        if not rows:
            raise HTTPException(status_code=404, detail="No data found in BigQuery")

        base_row = PlantState(**dict(rows[0])).dict()
        result = simulate_fuel_mix(base_row)

        return {
            "user": {"user_id": user["user_id"], "email": user["email"]},
            "simulation": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fuel simulation failed: {str(e)}")
