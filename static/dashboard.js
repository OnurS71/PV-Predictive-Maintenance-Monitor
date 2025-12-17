async function loadData() {
    const res = await fetch("/data");
    const data = await res.json();
    const container = document.getElementById("plants");
    container.innerHTML = "";

    data.plants.forEach(plant => {
        const div = document.createElement("div");
        div.className = "plant";

        div.innerHTML = `
            <div class="header">
                <h2>${plant.name} – ${plant.status}</h2>
                <div>${plant.city} | ${plant.kwp} kWp</div>
                <div>Abweichung: ${plant.deviation}% | Health-Score: ${plant.health_score}/100</div>
            </div>

            <div class="info-grid">
                <div class="info-box"><b>Typ</b><br>${plant.plant_type}</div>
                <div class="info-box"><b>Module</b><br>${plant.modules}</div>
                <div class="info-box"><b>Modulgröße</b><br>${plant.module_wp} Wp</div>
                <div class="info-box"><b>Strings</b><br>${plant.strings}</div>
                <div class="info-box"><b>Baujahr</b><br>${plant.year}</div>
                <div class="info-box"><b>Standort</b><br>${plant.city}</div>
            </div>

            <div class="weather-grid">
                <div class="info-box"><b>Temperatur</b><br>${plant.temperature} °C</div>
                <div class="info-box"><b>Wind</b><br>${plant.weather.wind} m/s</div>
                <div class="info-box"><b>Regen</b><br>${plant.weather.rain} mm</div>
                <div class="info-box"><b>Einstrahlung</b><br>${plant.weather.radiation} W/m²</div>
            </div>

            <div id="map-${plant.id}" class="map"></div>

            <canvas id="power-${plant.id}"></canvas>
            <canvas id="voltage-${plant.id}"></canvas>
            <canvas id="temp-${plant.id}"></canvas>
        `;

        container.appendChild(div);

        // Map
        const map = L.map(`map-${plant.id}`).setView([plant.lat, plant.lon], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        L.marker([plant.lat, plant.lon]).addTo(map);

        // Charts
        createChart(`power-${plant.id}`, "Leistung (kW)",
            ["Ist", "Soll"],
            [[plant.actual_kw], [plant.expected_kw]]
        );

        createChart(`voltage-${plant.id}`, "Spannung (V)",
            ["Spannung"],
            [[plant.voltage]]
        );

        createChart(`temp-${plant.id}`, "Temperatur (°C)",
            ["Temperatur"],
            [[plant.temperature]]
        );
    });
}

function createChart(id, label, seriesNames, values) {
    new Chart(document.getElementById(id), {
        type: "line",
        data: {
            labels: ["now"],
            datasets: seriesNames.map((name, i) => ({
                label: name,
                data: values[i],
                borderColor: i === 0 ? "#3ddc97" : "#ff6384",
                borderDash: i === 1 ? [5, 5] : [],
                fill: false
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: "#e0e0e0" } }
            },
            scales: {
                x: { ticks: { color: "#aaa" } },
                y: { ticks: { color: "#aaa" } }
            }
        }
    });
}

loadData();
setInterval(loadData, 5000);
