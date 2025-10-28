from fastapi import APIRouter, Depends
from app.models.plant_model import PlantState
from app.middleware.auth import require_auth
from app.services.gemini_service import get_recommendation
from app.services.energy_verify import verify_energy_saving

router = APIRouter(prefix="/recommendation", tags=["AI"])

@router.post("/")
def recommend(state: PlantState, user=Depends(require_auth)):
    gemini_output = get_recommendation(state.dict())
    vertex_input_modified = state.dict().copy()
    for rec in gemini_output.get("recommendations", []):
        vertex_input_modified[rec["parameter"]] = rec["new_value"]
    gemini_output["verified_saving_pct"] = verify_energy_saving(state.dict(), vertex_input_modified)
    return {
        "user": {"user_id": user["user_id"], "email": user["email"]},
        "recommendation": gemini_output
    }
