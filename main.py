from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
import requests
from datetime import datetime

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
            "&current=temperature_2m,shortwave_radiation"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        current = r.json().get("current", {})
        return {
            "temperature": current.get("temperature_2m", 15.0),
            "radiation": current.get("shortwave_radiation", 0.0)
        }
    except Exception:
        return {"temperature": 15.0, "radiation": 0.0}

@app.get("/data")
def get_data():
    plants_data = []

    for plant in PLANTS:
        weather = get_weather(plant["lat"], plant["lon"])
        temperature = weather
