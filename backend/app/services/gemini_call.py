import os
import json
import google.auth
from google.auth.transport.requests import Request
import google.generativeai as genai

if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
else:
    creds, _ = google.auth.default(
    scopes=["https://www.googleapis.com/auth/generative-language.retriever"])
    creds.refresh(Request())

    creds = creds.with_quota_project(os.getenv("GCP_PROJECT_ID"))

    genai.configure(credentials=creds)

def get_recommendation(state_dict: dict) -> dict:
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    You are an assistant helping optimize cement plant energy use.
    Given this plant state: {state_dict}

    Suggest energy optimization actions.

    IMPORTANT: Return strictly valid JSON only.
    Do NOT include any Markdown formatting, code fences, or extra text.
    Format:
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
    }}
    """

    try:
        response = model.generate_content(prompt)
        raw_output = response.candidates[0].content.parts[0].text.strip()
        
        # Cleanup: strip Markdown code fences if Gemini adds them
        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            if raw_output.lower().startswith("json"):
                raw_output = raw_output[4:].strip()
        
        return json.loads(raw_output)
    except Exception:
        return {
            "recommendations": [],
            "estimated_energy_saving_pct": 0.0,
            "confidence": "Low",
            "explanation": f"Failed to parse Gemini output: {raw_output}"
        }
