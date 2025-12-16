from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
import requests
from datetime import datetime

app = FastAPI()

# =========================
# Templates & Static
# =========================
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# =========================
# Anlagen
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
        "lat":
