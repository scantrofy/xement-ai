from fastapi import APIRouter, HTTPException
from google.cloud import bigquery
from app.models.plant_model import PlantState
import datetime

def build_aggregated_query(period: str, plant: str = "all") -> str:
    """
    Builds a dynamic SQL query that aggregates KPI values based on the selected time period.
    """
    base_table = "`xement-ai.xement_ai_dataset.xement_ai_refinement_data`"

    # Common filters
    where = ["timestamp <= CURRENT_TIMESTAMP()"]
    if plant != "all":
        where.append(f"plant_id = '{plant}'")

    where_clause = " AND ".join(where)

    # Default: last hour (latest snapshot)
    if period == "lastHour":
        return f"""
            SELECT *
            FROM {base_table}
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT 1
        """

    # Daily, shift, weekly aggregates
    if period == "today":
        period_filter = "DATE(timestamp) = CURRENT_DATE()"
        aggregation_type = "daily_avg"
    elif period == "currentShift":
        period_filter = "timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 8 HOUR)"
        aggregation_type = "shift_avg"
    elif period == "thisWeek":
        period_filter = "timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)"
        aggregation_type = "weekly_avg"
    else:
        # fallback to latest
        return f"""
            SELECT *
            FROM {base_table}
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT 1
        """

    # Aggregation query
    return f"""
        SELECT
          AVG(energy_use) AS energy_use,
          AVG(grinding_efficiency) AS grinding_efficiency,
          AVG(kiln_temp) AS kiln_temp,
          AVG(product_quality_index) AS product_quality_index,
          AVG(emissions_CO2) AS emissions,
          AVG(alt_fuel_pct) AS alt_fuel_pct,
          AVG(clinker_rate) AS clinker_rate,
          AVG(feed_rate) AS production_volume,
          MAX(timestamp) AS last_record_time,
          MIN(timestamp) AS period_start,
          COUNT(*) AS record_count,
          '{aggregation_type}' AS aggregation_type,
          (SELECT fuel_type 
           FROM (SELECT fuel_type, COUNT(*) as count 
                 FROM `xement-ai.xement_ai_dataset.xement_ai_refinement_data` 
                 WHERE {' AND '.join(where + [period_filter])}
                 GROUP BY fuel_type 
                 ORDER BY count DESC 
                 LIMIT 1)) as fuel_type,
          LOGICAL_OR(anomaly_flag) as has_anomaly
        FROM {base_table}
        WHERE {where_clause} AND {period_filter}
    """

router = APIRouter(prefix="", tags=["Public"])

@router.get("/latest_state")
def get_latest_state(plant: str = "all", period: str = "lastHour"):
    """
    Public endpoint: Get plant state data with time-based aggregation.
    
    Parameters:
    - plant: Filter by plant ID (default: 'all')
    - period: Time period for aggregation. One of: 'lastHour' (default), 'today', 'currentShift', 'thisWeek'
    
    Returns:
    - For 'lastHour': Latest reading within the last hour
    - For other periods: Aggregated statistics (averages) for the selected period
    """
    try:
        client = bigquery.Client()
        
        # Build and execute the appropriate query
        query = build_aggregated_query(period, plant)
        rows = list(client.query(query))
        
        if not rows:
            base_table = "`xement-ai.xement_ai_dataset.xement_ai_refinement_data`"
            fallback_query = f"""
                SELECT *
                FROM {base_table}
                {'WHERE plant_id = @plant' if plant != 'all' else ''}
                ORDER BY timestamp DESC
                LIMIT 1
            """
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("plant", "STRING", plant)
                ] if plant != 'all' else None
            )
            rows = list(client.query(fallback_query, job_config=job_config))
            
            if not rows:
                raise HTTPException(status_code=404, detail="No plant state data available")
        
        # Convert row to dict and add metadata
        state_data = dict(rows[0])
        
        # Add period metadata
        state_data["period"] = period
        state_data["source_table"] = "xement_ai_refinement_data"
        state_data["is_fallback"] = len(rows) == 1  # Indicates if this is a fallback result
        
        # Ensure timestamps are properly formatted
        current_time = datetime.datetime.now(datetime.timezone.utc)
        
        if 'timestamp' in state_data and state_data['timestamp'] > current_time:
            state_data['timestamp'] = current_time.isoformat()
            
        if 'last_record_time' in state_data and state_data['last_record_time'] > current_time:
            state_data['last_record_time'] = current_time.isoformat()
            
        if 'period_start' in state_data and state_data['period_start'] > current_time:
            state_data['period_start'] = current_time.isoformat()
        
        return state_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch plant state: {str(e)}"
        )


@router.get("/history")
def get_history(limit: int = 50, plant: str = "PlantA", period: str = "lastHour"):
    """
    Public endpoint: Get historical plant data from BigQuery.
    No authentication required.
    
    Args:
        limit: Number of records to return (default: 50, max: 1000)
        plant: Plant ID to filter by - must be one of: 'PlantA' (default), 'PlantB', or 'PlantC'
    """
    try:
        limit = min(limit, 1000)
        
        valid_plants = ['PlantA', 'PlantB', 'PlantC']
        if plant not in valid_plants:
            plant = 'PlantA'
            
        client = bigquery.Client()
        where_clauses = [
            "timestamp <= CURRENT_TIMESTAMP()", 
            f"plant_id = '{plant}'"
        ]

        if period == "lastHour":
            where_clauses.append("timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)")
        elif period == "currentShift":
            where_clauses.append("timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 8 HOUR)")
        elif period == "today":
            where_clauses.append("DATE(timestamp) = CURRENT_DATE()")
        elif period == "thisWeek":
            where_clauses.append("timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)")

        where_clause = " AND ".join(where_clauses)

        query = f"""
            SELECT * 
            FROM `xement-ai.xement_ai_dataset.xement_ai_refinement_data`
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT {limit}
        """
        rows = list(client.query(query))
        
        if not rows:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        current_time = datetime.datetime.now(datetime.timezone.utc)
        history_data = []
        for row in rows:
            row_data = dict(row)
            if 'timestamp' in row_data and row_data['timestamp'] > current_time:
                row_data['timestamp'] = current_time.isoformat()
            history_data.append(row_data)
        return history_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")
