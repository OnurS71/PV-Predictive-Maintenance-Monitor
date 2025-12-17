let charts = {}; // 🔑 Chart-Registry

async function loadData() {
    const res = await fetch("/data");
    const data = await res.json();
    const container = document.getElementById("plants");

    container.innerHTML = "";

    data.plants.forEach(p => {
        const div = document.createElement("div");
        div.className = `plant ${p.status}`;

        div.innerHTML = `
            <h2>${p.name} – ${p.status}</h2>
            <div>${p.city} | ${p.kwp} kWp</div>
            <div>Abweichung: ${p.deviation}% | Health-Score: ${p.health_score}/100</div>

            <h3>Anlagen-Steckbrief</h3>
            <div class="info-grid">
                <div class="info-box">Typ<br><b>${p.plant_type}</b></div>
                <div class="info-box">Module<br><b>${p.modules}</b></div>
                <div class="info-box">Modulgröße<br><b>${p.module_wp} Wp</b></div>
                <div class="info-box">Strings<br><b>${p.strings}</b></div>
                <div class="info-box">Baujahr<br><b>${p.year}</b></div>
                <div class="info-box">Standort<br><b>${p.city}</b></div>
            </div>

            <h3>Wetter am Standort</h3>
            <div class="weather-grid">
                <div class="info-box">Temperatur<br><b>${p.temperature} °C</b></div>
                <div class="info-box">Wind<br><b>${p.weather.wind} m/s</b></div>
                <div class="info-box">Regen<br><b>${p.weather.rain} mm</b></div>
                <div class="info-box">Einstrahlung<br><b>${p.weather.radiation} W/m²</b></div>
            </div>

            <div id="map-${p.id}" class="map"></div>

            <canvas id="power-${p.id}"></canvas>
            <canvas id="voltage-${p.id}"></canvas>
            <canvas id="temp-${p.id}"></canvas>
        `;

        container.appendChild(div);

        // Map
        const map = L.map(`map-${p.id}`).setView([p.lat, p.lon], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        L.marker([p.lat, p.lon]).addTo(map);

        // Charts
        renderChart(`power-${p.id}`, ["Ist", "Soll"], [[p.actual_kw], [p.expected_kw]]);
        renderChart(`voltage-${p.id}`, ["Spannung"], [[p.voltage]]);
        renderChart(`temp-${p.id}`, ["Temperatur"], [[p.temperature]]);
    });
}

function renderChart(id, labels, values) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    // 🔥 alten Chart zerstören
    if (charts[id]) {
        charts[id].destroy();
    }

    charts[id] = new Chart(canvas, {
        type: "line",
        data: {
            labels: ["now"],
            datasets: labels.map((label, i) => ({
                label: label,
                data: values[i],
                borderColor: i === 0 ? "#3ddc97" : "#ff6384",
                borderDash: i === 1 ? [5, 5] : [],
                fill: false,
                tension: 0.3
            }))
        },
        options: {
            responsive: true,
            animation: false,
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
