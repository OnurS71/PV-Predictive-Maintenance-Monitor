from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from simulation import simulate_all

app = FastAPI()

# Static files (JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def dashboard():
    return FileResponse("dashboard.html")

@app.get("/data")
def get_data():
    return {"plants": simulate_all()}
