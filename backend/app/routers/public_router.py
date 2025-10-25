from fastapi import APIRouter, HTTPException
from google.cloud import bigquery
from app.models.plant_model import PlantState

router = APIRouter(prefix="", tags=["Public"])

@router.get("/latest_state")
def get_latest_state():
    """
    Public endpoint: Get the latest plant state from BigQuery.
    No authentication required.
    """
    try:
        client = bigquery.Client()
        query = """
            SELECT * 
            FROM `xement-ai.xement_ai_dataset.serve_latest`
            ORDER BY timestamp DESC
            LIMIT 1
        """
        rows = list(client.query(query))
        
        if not rows:
            raise HTTPException(status_code=404, detail="No plant state data available")
        
        # Convert row to dict and return
        state_data = dict(rows[0])
        return state_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch latest state: {str(e)}")


@router.get("/history")
def get_history(limit: int = 50):
    """
    Public endpoint: Get historical plant data from BigQuery.
    No authentication required.
    
    Args:
        limit: Number of records to return (default: 50, max: 1000)
    """
    try:
        # Limit the maximum number of records to prevent abuse
        limit = min(limit, 1000)
        
        client = bigquery.Client()
        query = f"""
            SELECT * 
            FROM `xement-ai.xement_ai_dataset.serve_latest`
            ORDER BY timestamp DESC
            LIMIT {limit}
        """
        rows = list(client.query(query))
        
        if not rows:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        # Convert rows to list of dicts
        history_data = [dict(row) for row in rows]
        return history_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")
