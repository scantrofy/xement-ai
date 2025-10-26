from google.cloud import aiplatform
import os

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "xement-ai")
LOCATION = os.getenv("VERTEX_REGION", "us-central1")
ENDPOINT_ID = os.getenv("VERTEX_ENDPOINT_ID", "endpoint-id")

aiplatform.init(project=PROJECT_ID, location=LOCATION)

def predict_energy(instance: dict) -> float:
    endpoint = aiplatform.Endpoint(endpoint_name=f"projects/{PROJECT_ID}/locations/{LOCATION}/endpoints/{ENDPOINT_ID}")
    predictions = endpoint.predict(instances=[instance])
    pred = predictions.predictions[0]
    if isinstance(pred, dict):
        for v in pred.values():
            try:
                return float(v)
            except Exception:
                continue
    elif isinstance(pred, (list, tuple)):
        return float(pred[0])
    else:
        return float(pred)
