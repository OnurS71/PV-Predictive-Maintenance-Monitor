from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import random
import requests
from datetime import datetime

app = FastAPI()

# =========================
# Anlagen-Definition
# =========================
PLANTS = [
    {
        "id": 1,
        "name": "Anlage Wien",
        "city": "Wien",
        "type": "Dachanlage",
        "lat": 48.2082,
        "lon": 16.3738,
        "tilt": 30,
        "orientation": "Süd",
        "kwp": 120
    },
    {
        "id": 2,
        "name": "Anlage Linz",
        "city": "Linz",
        "type": "Dachanlage",
        "lat": 48.3069,
        "lon": 14.2858,
        "tilt": 25,
        "orientation": "Süd-Ost",
        "kwp": 80
    },
    {
        "id": 3,
        "name": "Anlage Graz",
        "city": "Graz",
        "type": "Freifläche",
        "lat": 47.0707,
        "lon": 15.4395,
        "tilt": 20,
        "orientation": "Süd",
        "kwp": 150
    }
]

# =========================
# Wetterdaten (Open-Meteo)
# =========================
def get_weather(lat, lon):
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&current=temperature_2m,shortwave_radiation"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        data = r.json()

        current = data.get("current", {})
        return {
            "temperature": current.get("temperature_2m", 15.0),
            "radiation": current.get("shortwave_radiation", 0.0)
        }

    except Exception:
        # Fallback → NIE 500
        return {
            "temperature": 15.0,
            "radiation": 0.0
        }

# =========================
# Daten-Endpoint
# =========================
@app.get("/data")
def get_data():
    plants_data = []

    for plant in PLANTS:
        weather = get_weather(plant["lat"], plant["lon"])

        # einfache Leistungs-Simulation
        irradiance_factor = weather["radiation"] / 1000
        kw = max(
            0,
            plant["kwp"] * irradiance_factor * random.uniform(0.85, 1.05)
        )

        voltage = random.uniform(650, 700)

        # Alarm-Logik
        status = "OK"
        if weather["temperature"] > 40 or voltage > 720:
            status = "ALARM"
        elif weather["temperature"] > 30:
            status = "WARNUNG"

        plants_data.append({
            "id": plant["id"],
            "name": plant["name"],
            "city": plant["city"],
            "type": plant["type"],
            "lat": plant["lat"],
            "lon": plant["lon"],
            "tilt": plant["tilt"],
            "orientation": plant["orientation"],
            "kwp": plant["kwp"],
            "kw": round(kw, 2),
            "voltage": round(voltage, 1),
            "temperature": round(weather["temperature"], 1),
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        })

    return {"plants": plants_data}

# =========================
# Dashboard ausliefern
# =========================
@app.get("/", response_class=HTMLResponse)
def dashboard():
    with open("dashboard.html", "r", encoding="utf-8") as f:
        return f.read()

# =========================
# Static Files
# =========================
app.mount("/static", StaticFiles(directory="static"), name="static")
