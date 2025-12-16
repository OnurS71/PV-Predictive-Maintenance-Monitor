from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import requests
import random
from datetime import datetime

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# === Anlagen-Standorte (über OSM ermittelt, hier fix hinterlegt) ===
PLANTS = [
    {"id": 1, "name": "Anlage 1", "lat": 48.2082, "lon": 16.3738, "peak_kw": 120},
    {"id": 2, "name": "Anlage 2", "lat": 48.3069, "lon": 14.2858, "peak_kw": 80},
    {"id": 3, "name": "Anlage 3", "lat": 47.0707, "lon": 15.4395, "peak_kw": 100},
]

def get_weather(lat, lon):
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,shortwave_radiation"
    )
    r = requests.get(url, timeout=5)
    return r.json()["current"]

def calc_expected_kw(radiation, peak_kw):
    # einfache, saubere Näherung
    return round(peak_kw * (radiation / 1000), 2)

def alarm_state(actual, expected):
    if expected <= 0:
        return "OK"
    deviation = (actual - expected) / expected * 100
    if deviation < -25:
        return "ALARM"
    if deviation < -10:
        return "WARN"
    return "OK"

@app.get("/", response_class=HTMLResponse)
def index():
    with open("dashboard.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/data")
def data():
    result = []
    for p in PLANTS:
        weather = get_weather(p["lat"], p["lon"])
        expected_kw = calc_expected_kw(weather["shortwave_radiation"], p["peak_kw"])

        # --- Simulation Ist-Daten ---
        actual_kw = round(expected_kw * random.uniform(0.7, 1.05), 2)
        voltage = round(random.uniform(600, 800), 1)
        temperature = round(weather["temperature_2m"] + random.uniform(5, 15), 1)

        result.append({
            "id": p["id"],
            "name": p["name"],
            "timestamp": datetime.utcnow().isoformat(),
            "actual_kw": actual_kw,
            "expected_kw": expected_kw,
            "voltage": voltage,
            "temperature": temperature,
            "alarm": alarm_state(actual_kw, expected_kw)
        })

    return {"plants": result}
