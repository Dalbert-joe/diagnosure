import os, json, re, textwrap
from typing import List
from PIL import Image
import google.generativeai as genai

# === CONFIG ===
API_KEY = "AIzaSyDym3m9_ThrdIMzT9kbmKSW5U-rA5DKpqw"
MODEL_ID = "gemini-1.5-flash"
genai.configure(api_key=os.environ.get("GEMINI_API_KEY") or API_KEY)
model = genai.GenerativeModel(MODEL_ID)

# === HELPER FUNCTIONS ===
def analyze_image(image_path):
    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        return f"⚠ Could not load image {image_path}: {e}"
    response = model.generate_content([
        "Look at this image. Identify the main problem or issue shown. Reply in one line like: Issue is: <description>",
        img
    ])
    return response.text.strip()

def normalize_gender(input_str):
    s = input_str.lower()
    if any(x in s for x in ["male","m","boy","man"]):
        return "Male"
    elif any(x in s for x in ["female","f","girl","woman"]):
        return "Female"
    else:
        return "Other"

# === MAIN FUNCTION ===
def generate_diagnosis(
    name: str,
    age: int,
    gender: str,
    preferred_language: str,
    symptoms: List[str],
    taking_pills: str,
    duration: str,
    known_conditions: str,
    pain_rating: int,
    images: List[str] = []
):
    gender = normalize_gender(gender)

    # Process image inputs
    for img_path in images:
        issue = analyze_image(img_path)
        if issue:
            symptoms.append(issue)

    # === SYSTEM INSTRUCTIONS FOR GEMINI ===
    SYS_INSTRUCTIONS = textwrap.dedent(f"""
    You are a professional medical triage assistant.
    Respond in {preferred_language}.
    Patient info:
    - Name: {name}, Age: {age}, Gender: {gender}
    Symptoms: {', '.join(symptoms)}
    Pain rating: {pain_rating}/10
    Taking pills: {taking_pills}
    Duration: {duration}
    Known conditions: {known_conditions}

    CRITICAL:
    For each of the top five possible conditions, provide:
    1. Name
    2. Probability (0-100 integer, sum=100)
    3. Severity: low, moderate, high
    4. Urgency: see doctor immediately or monitor 2-3 days
    5. Reason: why this condition is suspected
    6. Recommended doctor type (e.g., dermatologist, cardiologist)
    
    Output STRICT JSON ONLY like:
    {{
      "conditions":[
        {{"name":"...","prob":0-100,"severity":"low|moderate|high","urgency":"see doctor immediately|monitor 2-3 days","reason":"...","doctor":"..."}},
        ...
      ]
    }}
    """).strip()

    user_payload = {
        "symptoms": symptoms,
        "mandatory": {
            "taking_pills": taking_pills,
            "duration": duration,
            "known_conditions": known_conditions,
            "pain_rating": pain_rating
        }
    }

    prompt = textwrap.dedent(f"""
    TASK:
    Return the top five differential diagnoses with all required fields (name, prob, severity, urgency, reason, doctor).
    Strict JSON output only. Input data:
    {json.dumps(user_payload, ensure_ascii=False, indent=2)}
    """).strip()

    # Call Gemini
    try:
        resp = model.generate_content([SYS_INSTRUCTIONS, prompt])
        raw = resp.text.strip()
        data = json.loads(raw)
        return {"status":"success", "conditions": data.get("conditions", [])}
    except Exception as e:
        return {"status":"error", "message": f"AI generation error: {e}", "raw_output": raw if 'raw' in locals() else ""}


# === FLASK API ===
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/diagnosis', methods=['POST'])
def api_diagnosis():
    data = request.get_json(force=True)
    # Extract fields with defaults for robustness
    name = data.get('name', 'Anonymous')
    age = data.get('age', 30)
    gender = data.get('gender', 'Other')
    preferred_language = data.get('preferred_language', 'English')
    symptoms = data.get('symptoms', [])
    taking_pills = data.get('taking_pills', 'no')
    duration = data.get('duration', '')
    known_conditions = data.get('known_conditions', '')
    pain_rating = data.get('pain_rating', 5)
    images = data.get('images', [])

    result = generate_diagnosis(
        name=name,
        age=age,
        gender=gender,
        preferred_language=preferred_language,
        symptoms=symptoms,
        taking_pills=taking_pills,
        duration=duration,
        known_conditions=known_conditions,
        pain_rating=pain_rating,
        images=images
    )
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
