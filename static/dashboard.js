let charts = {};
let history = {};

// Zeitreihe puffern
function pushHistory(key, value, max = 20) {
    if (!history[key]) history[key] = [];
    history[key].push(value);
    if (history[key].length > max) history[key].shift();
    return history[key];
}

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

            <div class="chart-grid">
                <canvas id="power-${p.id}"></canvas>
                <canvas id="voltage-${p.id}"></canvas>
                <canvas id="temp-${p.id}"></canvas>
            </div>
        `;

        container.appendChild(div);

        // Karte (nach DOM-Aufbau!)
        setTimeout(() => {
            const map = L.map(`map-${p.id}`, { scrollWheelZoom: false })
                .setView([p.lat, p.lon], 11);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap"
            }).addTo(map);

            L.marker([p.lat, p.lon]).addTo(map);
        }, 0);

        // Charts
        renderChart(
            `power-${p.id}`,
            ["Ist", "Soll"],
            [
                pushHistory(`actual-${p.id}`, p.actual_kw),
                pushHistory(`expected-${p.id}`, p.expected_kw)
            ],
            0, p.kwp * 1.1, "kW"
        );

        renderChart(
            `voltage-${p.id}`,
            ["Spannung"],
            [pushHistory(`voltage-${p.id}`, p.voltage)],
            600, 800, "V"
        );

        renderChart(
            `temp-${p.id}`,
            ["Temperatur"],
            [pushHistory(`temp-${p.id}`, p.temperature)],
            -20, 80, "°C"
        );
    });
}

function renderChart(id, labels, datasets, yMin, yMax, unit) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    if (charts[id]) charts[id].destroy();

    charts[id] = new Chart(canvas, {
        type: "line",
        data: {
            labels: datasets[0].map((_, i) => i),
            datasets: labels.map((label, i) => ({
                label,
                data: datasets[i],
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
                legend: { labels: { color: "#ccc" } }
            },
            scales: {
                x: { display: false },
                y: {
                    min: yMin,
                    max: yMax,
                    ticks: {
                        color: "#aaa",
                        callback: v => v + " " + unit
                    }
                }
            }
        }
    });
}

loadData();
setInterval(loadData, 5000);
