import os
import json
import google.generativeai as genai

# Configure Gemini
API_KEY = os.environ.get("GEMINI_API_KEY") or "AIzaSyDym3m9_ThrdIMzT9kbmKSW5U-rA5DKpqw"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

def get_top_hospitals(city: str, condition: str):
    """
    Returns top 5 hospitals in a city for a condition (AI knowledge-based)
    """
    prompt = f"""
    Patient’s city: {city}
    Condition: {condition}

    Task: Without searching the web, provide 5 reputable hospitals in {city} that are well-known for treating {condition}.
    Output as a JSON array only: ["Hospital 1", "Hospital 2", "Hospital 3", "Hospital 4", "Hospital 5"]
    """

    try:
        resp = model.generate_content(prompt)
        # Attempt to parse JSON
        hospitals = json.loads(resp.text.strip())
        if isinstance(hospitals, list) and len(hospitals) == 5:
            return {"status": "success", "hospitals": hospitals}
        else:
            # fallback if AI output is not perfect
            return {"status": "success", "hospitals": hospitals[:5]}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Example Run
if __name__ == "__main__":
    city = input("Enter city: ")
    condition = input("Enter condition: ")
    output = get_top_hospitals(city, condition)
    print(json.dumps(output, indent=2))
