from google.cloud import aiplatform

def predict_energy(instance_dict: dict) -> float:
    client = aiplatform.gapic.PredictionServiceClient()
    endpoint = "projects/cement-ops-472217/locations/us-central1/endpoints/3291175852003295232"
    response = client.predict(
        endpoint=endpoint,
        instances=[instance_dict]
    )
    pred = response.predictions[0]
    if isinstance(pred, dict) and "value" in pred:
        return float(pred["value"])
    raise ValueError(f"Unexpected response: {pred}")

def verify_energy_saving(original: dict, recommended: dict) -> float:
    orig_e = predict_energy(original)
    rec_e = predict_energy(recommended)
    return 100.0 * (orig_e - rec_e) / orig_e
