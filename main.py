from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from datetime import datetime
import random
import math
import requests

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

PLANTS = [
    {
        "id": 1,
        "name": "Anlage Wien",
        "city": "Wien",
        "lat": 48.2082,
        "lon": 16.3738,
        "kwp": 120,
        "plant_type": "Dachanlage",
        "modules": 300,
        "module_wp": 400,
        "strings": 10,
        "year": 2021
    },
    {
        "id": 2,
        "name": "Anlage Linz",
        "city": "Linz",
        "lat": 48.3069,
        "lon": 14.2858,
        "kwp": 80,
        "plant_type": "Dachanlage",
        "modules": 200,
        "module_wp": 400,
        "strings": 8,
        "year": 2020
    },
    {
        "id": 3,
        "name": "Anlage Graz",
        "city": "Graz",
        "lat": 47.0707,
        "lon": 15.4395,
        "kwp": 150,
        "plant_type": "Freifläche",
        "modules": 375,
        "module_wp": 400,
        "strings": 15,
        "year": 2019
    }
]


def get_temperature(lat, lon):
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&current=temperature_2m"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return r.json()["current"]["temperature_2m"]
    except Exception:
        return 10.0

def solar_factor():
    now = datetime.utcnow()
    hour = now.hour + now.minute / 60
    if hour < 6 or hour > 18:
        return 0
    return math.sin((hour - 6) / 12 * math.pi)

def get_weather(lat, lon):
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&current=temperature_2m,wind_speed_10m,precipitation,shortwave_radiation"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        current = r.json()["current"]

        return {
            "temperature": current.get("temperature_2m", 0.0),
            "wind": current.get("wind_speed_10m", 0.0),
            "rain": current.get("precipitation", 0.0),
            "radiation": current.get("shortwave_radiation", 0.0)
        }
    except Exception:
        return {
            "temperature": 0.0,
            "wind": 0.0,
            "rain": 0.0,
            "radiation": 0.0
        }

@app.get("/data")
def data():
    plants = []
    sun = solar_factor()

    for p in PLANTS:
        weather = get_weather(p["lat"], p["lon"])
        temp = weather["temperature"]
        radiation = weather["radiation"]


        expected_kw = p["kwp"] * sun
        actual_kw = expected_kw * random.uniform(0.85, 1.05)
        voltage = 600 + sun * 140 + random.uniform(-20, 20)

        deviation = 0 if expected_kw == 0 else (actual_kw - expected_kw) / expected_kw * 100

        score = max(
            0,
            100
            - abs(deviation) * 1.5
            - max(0, temp - 35) * 2
            - max(0, voltage - 720) * 0.5
        )

        status = "OK"
        if score < 50 or voltage > 750 or temp > 45:
            status = "ALARM"
        elif score < 75 or voltage > 720 or temp > 35:
            status = "WARN"

      plants.append({
            "id": p["id"],
            "name": p["name"],
            "city": p["city"],
            "lat": p["lat"],
            "lon": p["lon"],
            "kwp": p["kwp"],

            "plant_type": p["plant_type"],
            "modules": p["modules"],
            "module_wp": p["module_wp"],
            "strings": p["strings"],
            "year": p["year"],

            "expected_kw": round(expected_kw, 2),
            "actual_kw": round(actual_kw, 2),
            "voltage": round(voltage, 1),
            "temperature": round(temp, 1),

            "weather": {
                "wind": round(weather["wind"], 1),
                "rain": round(weather["rain"], 1),
                "radiation": round(weather["radiation"], 1)
    },

            "deviation": round(deviation, 1),
            "health_score": round(score, 0),
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
})


    return {"plants": plants}

@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})
