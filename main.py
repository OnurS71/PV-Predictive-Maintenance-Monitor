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
        "kwp": 120
    },
    {
        "id": 2,
        "name": "Anlage Linz",
        "city": "Linz",
        "type": "Dachanlage",
        "lat": 48.3069,
        "lon": 14.2858,
        "kwp": 80
    },
    {
        "id": 3,
        "name": "Anlage Graz",
        "city": "Graz",
        "type": "Freifläche",
        "lat": 47.0707,
        "lon": 15.4395,
        "kwp": 150
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

@app.get("/data")
def data():
    result = []
    sun = solar_factor()

    for p in PLANTS:
        temp = get_temperature(p["lat"], p["lon"])
        expected_kw = p["kwp"] * sun
        actual_kw = expected_kw * random.uniform(0.85, 1.05)
        voltage = 600 + sun * 120 + random.uniform(-15, 15)

        status = "OK"
        if temp > 45 or voltage > 750 or actual_kw < expected_kw * 0.7:
            status = "ALARM"
        elif temp > 35 or voltage > 720:
            status = "WARN"

        result.append({
            "id": p["id"],
            "name": p["name"],
            "city": p["city"],
            "type": p["type"],
            "lat": p["lat"],
            "lon": p["lon"],
            "kwp": p["kwp"],
            "actual_kw": round(actual_kw, 2),
            "expected_kw": round(expected_kw, 2),
            "voltage": round(voltage, 1),
            "temperature": round(temp, 1),
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        })

    return {"plants": result}

@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})
