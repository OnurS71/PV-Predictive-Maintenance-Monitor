from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import requests
import random
from datetime import datetime

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# === Anlagen-Definition ===
PLANTS = [
    {
        "id": 1,
        "name": "Wien – Dachanlage",
        "location": "Wien",
        "lat": 48.2082,
        "lon": 16.3738,
        "type": "Dachanlage",
        "tilt": 30,
        "orientation": "Süd",
        "peak_kwp": 120
    },
    {
        "id": 2,
        "name": "Linz – Gewerbedach",
        "location": "Linz",
        "lat": 48.3069,
        "lon": 14.2858,
        "type": "Flachdach Ost/West",
        "tilt": 10,
        "orientation": "Ost/West",
        "peak_kwp": 80
    },
    {
        "id": 3,
        "name": "Graz – Freifläche",
        "location": "Graz Umgebung",
        "lat": 47.0707,
        "lon": 15.4395,
        "type": "Freiflächenanlage",
        "tilt": 25,
        "orientation": "Süd",
        "peak_kwp": 100
    }
]

def get_weather(lat, lon):
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,shortwave_radiation"
    )
    r = requests.get(url, timeout=5)
    return r.json()["current"]

def calc_expected_kw(radiation, peak_kwp):
    return round(peak_kwp * (radiation / 1000), 2)

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
    plants_data = []
    for p in PLANTS:
        weather = get_weathe_
