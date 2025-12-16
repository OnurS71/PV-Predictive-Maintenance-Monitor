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
            "temperature_2m": current.get("temperature_2m", 15.0),
            "shortwave_radiation": current.get("shortwave_radiation", 0.0)
        }

    except Exception as e:
        # Fallback, damit /data NIE 500 wirft
        return {
            "temperature_2m": 15.0,
            "shortwave_radiation": 0.0
        }
