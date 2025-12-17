async function loadData() {
    const res = await fetch("/data");
    const data = await res.json();

    const container = document.getElementById("plants");
    container.innerHTML = "";

    data.plants.forEach(p => {

        // Fallbacks – extrem wichtig
        const plantType = p.plant_type || "–";
        const modules = p.modules ?? "–";
        const moduleWp = p.module_wp ?? "–";
        const strings = p.strings ?? "–";
        const year = p.year ?? "–";

        const weather = p.weather || {};
        const wind = weather.wind ?? "–";
        const rain = weather.rain ?? "–";
        const radiation = weather.radiation ?? "–";

        const div = document.createElement("div");
        div.className = "plant";

        div.innerHTML = `
            <h2>${p.name} – ${p.status}</h2>
            <div>${p.city} | ${p.kwp} kWp</div>
            <div>Abweichung: ${p.deviation}% | Health-Score: ${p.health_score}/100</div>

            <h3>Anlagen-Steckbrief</h3>
            <div class="info-grid">
                <div class="info-box"><b>Typ</b><br>${plantType}</div>
                <div class="info-box"><b>Module</b><br>${modules}</div>
                <div class="info-box"><b>Modulgröße</b><br>${moduleWp} Wp</div>
                <div class="info-box"><b>Strings</b><br>${strings}</div>
                <div class="info-box"><b>Baujahr</b><br>${year}</div>
                <div class="info-box"><b>Standort</b><br>${p.city}</div>
            </div>

            <h3>Wetter am Standort</h3>
            <div class="weather-grid">
                <div class="info-box"><b>Temperatur</b><br>${p.temperature} °C</div>
                <div class="info-box"><b>Wind</b><br>${wind} m/s</div>
                <div class="info-box"><b>Regen</b><br>${rain} mm</div>
                <div class="info-box"><b>Einstrahlung</b><br>${radiation} W/m²</div>
            </div>

            <div id="map-${p.id}" class="map"></div>

            <canvas id="power-${p.id}"></canvas>
            <canvas id="voltage-${p.id}"></canvas>
            <canvas id="temp-${p.id}"></canvas>
        `;

        container.appendChild(div);

        // Karte
        const map = L.map(`map-${p.id}`).setView([p.lat, p.lon], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        L.marker([p.lat, p.lon]).addTo(map);

        // Charts
        createChart(`power-${p.id}`, ["Ist", "Soll"], [[p.actual_kw], [p.expected_kw]]);
        createChart(`voltage-${p.id}`, ["Spannung"], [[p.voltage]]);
        createChart(`temp-${p.id}`, ["Temperatur"], [[p.temperature]]);
    });
}

function createChart(id, labels, values) {
    new Chart(document.getElementById(id), {
        type: "line",
        data: {
            labels: ["now"],
            datasets: labels.map((l, i) => ({
                label: l,
                data: values[i],
                borderColor: i === 0 ? "#3ddc97" : "#ff6384",
                borderDash: i === 1 ? [5, 5] : [],
                fill: false
            }))
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#eee" } } },
            scales: {
                x: { ticks: { color: "#aaa" } },
                y: { ticks: { color: "#aaa" } }
            }
        }
    });
}

loadData();
setInterval(loadData, 5000);
