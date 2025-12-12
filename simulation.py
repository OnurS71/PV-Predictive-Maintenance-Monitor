import math
import random
import datetime

def simulate_pv_plant(plant_id):
    now = datetime.datetime.utcnow()
    hour = now.hour + now.minute/60

    # Sonnenkurve (Mittag = Peak)
    solar_curve = max(0, math.sin((hour - 6) / 12 * math.pi))

    # Größere Anlagen erzeugen mehr Leistung
    plant_capacity = {
        1: 120,  # kWp
        2: 85,
        3: 200
    }

    max_kw = plant_capacity[plant_id]

    # Wolken-Effekt
    noise = random.uniform(-0.15, 0.15)

    # Realistische Leistung
    kw = max(0, (solar_curve + noise) * max_kw)

    # DC-Spannung abhängig von Einstrahlung
    voltage = 600 + solar_curve * 200 + random.uniform(-10, 10)

    # Modul-Temperatur
    temp = 20 + solar_curve * 25 + random.uniform(-2, 2)

    return {
        "plant_id": plant_id,
        "kw": round(kw, 2),
        "voltage": round(voltage, 1),
        "temperature": round(temp, 1),
        "timestamp": now.isoformat()
    }

def simulate_all():
    return [simulate_pv_plant(i) for i in [1, 2, 3]]
