import os
import json
import google.auth
from google.auth.transport.requests import Request
import google.generativeai as genai

def configure_genai():
    """
    Configure Gemini for both local and Cloud Run environments.
    - Locally: use GEMINI_API_KEY (for manual testing).
    - Cloud Run: use Application Default Credentials (ADC) from service account.
    """
    if os.getenv("GEMINI_API_KEY"):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    else:
        creds, _ = google.auth.default(
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        creds.refresh(Request())
        genai.configure(credentials=creds)


def get_recommendation(state_dict: dict) -> dict:
    configure_genai()
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    You are an AI assistant optimizing cement plant energy use.
    Given this current plant state: {state_dict}

    Suggest 2–3 actionable process adjustments to improve energy efficiency,
    without reducing product quality.

    Return strictly valid JSON (no Markdown, no code blocks):
    {{
      "recommendations": [
        {{
          "parameter": "string",
          "action": "increase | decrease | maintain",
          "new_value": float
        }}
      ],
      "estimated_energy_saving_pct": float,
      "confidence": "High | Medium | Low",
      "explanation": "string"
    }}
    """

    try:
        response = model.generate_content(prompt)
        raw_output = response.candidates[0].content.parts[0].text.strip()

        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            if raw_output.lower().startswith("json"):
                raw_output = raw_output[4:].strip()

        return json.loads(raw_output)
    except Exception as e:
        return {
            "recommendations": [],
            "estimated_energy_saving_pct": 0.0,
            "confidence": "Low",
            "explanation": f"Gemini output parsing failed: {str(e)}"
        }