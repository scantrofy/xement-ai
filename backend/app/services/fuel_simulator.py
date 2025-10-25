import pandas as pd
from datetime import datetime, timezone
from google.cloud import aiplatform

ENDPOINT_RESOURCE = "projects/cement-ops-472217/locations/us-central1/endpoints/3291175852003295232"
EMISSION_FACTORS = {
    "fossil": 0.85,
    "alt":    0.10
}
ENERGY_REDUCTION_PER_ALT_PCT = 0.0025

def prepare_instance(base_row, alt_pct):
    inst = base_row.copy()
    inst["alt_fuel_pct"] = str(float(alt_pct))

    if "timestamp" not in inst:
        inst["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f UTC")

    now = datetime.utcnow()
    inst["hour_of_day"] = str(now.hour)
    inst["day_of_week"] = str(now.weekday())
    
    return inst

def call_vertex_endpoint(instances):
    endpoint = aiplatform.Endpoint(ENDPOINT_RESOURCE)
    response = endpoint.predict(instances=instances)
    return response.predictions

def heuristic_energy_adjustment(base_energy, alt_pct, alpha=ENERGY_REDUCTION_PER_ALT_PCT):
    reduction_factor = 1.0 - (alpha * alt_pct)
    return base_energy * reduction_factor

def compute_emissions_kgh(energy_kwh_per_ton, alt_pct):
    alt_frac = alt_pct / 100.0
    fossil_frac = 1.0 - alt_frac
    ef = (fossil_frac * EMISSION_FACTORS['fossil'] + alt_frac * EMISSION_FACTORS['alt'])
    return energy_kwh_per_ton * ef

def unwrap_prediction(p):
    if isinstance(p, dict):
        key = list(p.keys())[0]
        return float(p[key])
    elif isinstance(p, (list, tuple)):
        return float(p[0])
    else:
        return float(p)

def simulate_fuel_mix(base_row, alt_values=list(range(0, 61, 10))):
    instances = [prepare_instance(base_row, pct) for pct in alt_values]

    try:
        preds = call_vertex_endpoint(instances)
        pred_energies = [unwrap_prediction(p) for p in preds]
    except Exception:
        base_energy = base_row.get("energy_use", 220.0)
        pred_energies = [heuristic_energy_adjustment(base_energy, pct) for pct in alt_values]

    # Compute emissions
    emissions_kg = [compute_emissions_kgh(e, pct) for e, pct in zip(pred_energies, alt_values)]

    # Return structured JSON
    df = pd.DataFrame({
        "alt_fuel_pct": alt_values,
        "pred_energy_kwh_per_ton": pred_energies,
        "emissions_kgCO2_per_ton": emissions_kg
    })
    return df.to_dict(orient="records")
