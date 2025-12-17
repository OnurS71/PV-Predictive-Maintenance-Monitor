console.log("dashboard.js geladen");

async function loadDashboard() {
    const res = await fetch("/data");
    const plants = await res.json();

    const container = document.getElementById("plants");
    container.innerHTML = "";

    plants.forEach(p => {
        // ===== Anlagen-Container =====
        const plantDiv = document.createElement("div");
        plantDiv.className = "plant";

        plantDiv.innerHTML = `
            <div class="header">
                <h2>${p.name} – ${p.city}</h2>
            </div>

            <div class="info-grid">
                <div class="info-box">Typ<br>${p.type}</div>
                <div class="info-box">kWp<br>${p.kwp}</div>
                <div class="info-box">Ausrichtung<br>${p.orientation}</div>
                <div class="info-box">Neigung<br>${p.tilt}°</div>
                <div class="info-box">Status<br>${p.status}</div>
                <div class="info-box">Zeit<br>${p.timestamp}</div>
            </div>

            <div class="chart-grid">
                <div class="chart-box">
                    <canvas id="power-${p.id}"></canvas>
                </div>
                <div class="chart-box">
                    <canvas id="voltage-${p.id}"></canvas>
                </div>
                <div class="chart-box">
                    <canvas id="temp-${p.id}"></canvas>
                </div>
            </div>

            <div id="map-${p.id}" class="map"></div>
        `;

        container.appendChild(plantDiv);

        // ===== MAP =====
        const map = L.map(`map-${p.id}`).setView([p.lat, p.lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap"
        }).addTo(map);

        L.marker([p.lat, p.lon]).addTo(map)
            .bindPopup(p.name)
            .openPopup();

        // ===== DATEN (History-Simulation) =====
        const labels = [];
        const actualKW = [];
        const expectedKW = [];
        const voltage = [];
        const temperature = [];

        for (let i = 0; i < 24; i++) {
            labels.push(`${i}:00`);
            actualKW.push(p.actual_kw * (0.7 + Math.random() * 0.6));
            expectedKW.push(p.expected_kw);
            voltage.push(p.voltage + (Math.random() * 10 - 5));
            temperature.push(p.temperature + (Math.random() * 4 - 2));
        }

        // ===== POWER CHART =====
        new Chart(document.getElementById(`power-${p.id}`), {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "IST-Leistung (kW)",
                        data: actualKW,
                        borderColor: "#3ddc97",
                        tension: 0.3
                    },
                    {
                        label: "SOLL-Leistung (kW)",
                        data: expectedKW,
                        borderColor: "#888",
                        borderDash: [5, 5],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // ===== VOLTAGE CHART =====
        new Chart(document.getElementById(`voltage-${p.id}`), {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "DC-Spannung (V)",
                    data: voltage,
                    borderColor: "#4aa3ff",
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 600,
                        max: 750
                    }
                }
            }
        });

        // ===== TEMPERATURE CHART =====
        new Chart(document.getElementById(`temp-${p.id}`), {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Temperatur (°C)",
                    data: temperature,
                    borderColor: "#ff6b6b",
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: -10,
                        max: 60
                    }
                }
            }
        });
    });
}

loadDashboard();
