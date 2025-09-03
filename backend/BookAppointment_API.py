import mysql.connector
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

DB_CFG = {"host":"localhost","user":"root","passwd":"admin123","database":"nexora_medassist"}
SLOTS = ["Morning", "Afternoon", "Evening", "Night"]

# 1️⃣ List hospitals by city
@app.route("/api/hospitals", methods=["GET"])
def list_hospitals():
    city_filter = request.args.get("city", "")
    # MOCK DATA
    hospitals = [
        {"id": 1, "name": "CityCare Hospital", "city": "Lagos"},
        {"id": 2, "name": "Prime Medical Center", "city": "Lagos"},
        {"id": 3, "name": "Sunrise Clinic", "city": "Abuja"},
        {"id": 4, "name": "Greenfield Hospital", "city": "Abuja"},
        {"id": 5, "name": "Hopewell Hospital", "city": "Kano"}
    ]
    if city_filter:
        hospitals = [h for h in hospitals if city_filter.lower() in h["city"].lower()]
    return jsonify({"status":"success", "hospitals": hospitals})

# 2️⃣ Book appointment with chatbox note
@app.route("/api/book", methods=["POST"])
def book_appointment():
    data = request.json
    required_fields = ["hospital_name", "username", "age", "sex", "issue", "date", "session", "note", "city", "contact_email"]
    for f in required_fields:
        if f not in data:
            return jsonify({"status":"error","message":f"Missing field: {f}"}), 400
    # MOCK: Just echo back
    return jsonify({"status":"success","message":"Booking confirmed.", "data": data})

# 3️⃣ List available sessions
@app.route("/api/sessions", methods=["GET"])
def list_sessions():
    return jsonify({"status":"success","sessions": SLOTS})

# Run Flask API
if __name__ == "__main__":
    app.run(debug=True, port=5000)
