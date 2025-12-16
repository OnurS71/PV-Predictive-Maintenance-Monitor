from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
import requests
from datetime import datetime
import math

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

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

def get_weather(lat, lon):
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&current=temperature_2m"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        current = r.json().get("current", {})
        return current.get("temperature_2m", 10.0)
    except Exception:
        return 10.0

def solar_curve():
    now = datetime.utcnow()
    hour = now.hour + now.minute / 60

    # Sonnenaufgang ~6, Sonnenuntergang ~18
    if hour < 6 or hour > 18:
        return 0

    # Sinuskurve (Peak um 12)
    return math.sin((hour - 6) / 12 * math.pi)

@app.get("/data")
def get_data():
    plants_data = []

    sun_factor = solar_curve()

    for plant in PLANTS:
        temperature = get_weather(plant["lat"], plant["lon"])

        expected_kw = plant["kwp"] * sun_factor
        actual_kw = expected_kw * random.uniform(0.9, 1.05)

        voltage = 600 + sun_factor * 100 + random.uniform(-10, 10)

        status = "OK"
        if temperature > 40 or voltage > 720:
            status = "ALARM"
        elif temperature > 30:
            status = "WARN"

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

            "actual_kw": round(max(0, actual_kw), 2),
            "expected_kw": round(max(0, expected_kw), 2),
            "voltage": round(voltage, 1),
            "temperature": round(temperature, 1),

            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        })

    return {"plants": plants_data}

@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})
