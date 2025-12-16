let kwChart, voltChart, tempChart;

async function loadData() {
    const res = await fetch("/data");
    const json = await res.json();
    const plants = json.plants;

    const container = document.getElementById("plants");
    container.innerHTML = "";

    const hour = new Date().getUTCHours();

    // -----------------------------
    // ANLAGEN ANZEIGE
    // -----------------------------
    plants.forEach(p => {
        let css = "plant";

        if (p.temperature > 50) css += " alarm";
        else if (p.voltage < 500) css += " warning";
        else if (p.kw < 1 && hour >= 7 && hour <= 17) css += " warning";

        container.innerHTML += `
            <div class="${css}">
                <h2>Anlage ${p.plant_id}</h2>
                <p><strong>Leistung:</strong> ${p.kw} kW</p>
                <p><strong>Spannung:</strong> ${p.voltage} V</p>
                <p><strong>Temperatur:</strong> ${p.temperature} °C</p>
                <p>${p.timestamp}</p>
            </div>
        `;
    });

    // -----------------------------
    // DIAGRAMME UPDATEN
    // -----------------------------
    updateCharts(plants);
}

function updateCharts(plants) {
    const labels = plants.map(p => "Anlage " + p.plant_id);

    const kwValues = plants.map(p => p.kw);
    const voltValues = plants.map(p => p.voltage);
    const tempValues = plants.map(p => p.temperature);

    if (!kwChart) {
        const ctx1 = document.getElementById("kwChart").getContext("2d");
        kwChart = new Chart(ctx1, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Leistung (kW)",
                    data: kwValues,
                    backgroundColor: "rgba(0, 200, 150, 0.6)"
                }]
            }
        });
    } else {
        kwChart.data.labels = labels;
        kwChart.data.datasets[0].data = kwValues;
        kwChart.update();
    }

    if (!voltChart) {
        const ctx2 = document.getElementById("voltChart").getContext("2d");
        voltChart = new Chart(ctx2, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Spannung (V)",
                    data: voltValues,
                    borderColor: "orange"
                }]
            }
        });
    } else {
        voltChart.data.labels = labels;
        voltChart.data.datasets[0].data = voltValues;
        voltChart.update();
    }

    if (!tempChart) {
        const ctx3 = document.getElementById("tempChart").getContext("2d");
        tempChart = new Chart(ctx3, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Temperatur (°C)",
                    data: tempValues,
                    borderColor: "red"
                }]
            }
        });
    } else {
        tempChart.data.labels = labels;
        tempChart.data.datasets[0].data = tempValues;
        tempChart.update();
    }
}

// Alle 5 Sekunden aktualisieren
loadData();
setInterval(loadData, 5000);

