let kwChart, voltChart, tempChart;

// Charts initialisieren
function setupCharts() {
    const kwCtx = document.getElementById("kwChart").getContext("2d");
    const voltCtx = document.getElementById("voltChart").getContext("2d");
    const tempCtx = document.getElementById("tempChart").getContext("2d");

    kwChart = new Chart(kwCtx, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Leistung (kW)", data: [] }] },
        options: { responsive: true }
    });

    voltChart = new Chart(voltCtx, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Spannung (V)", data: [] }] },
        options: { responsive: true }
    });

    tempChart = new Chart(tempCtx, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Temperatur (°C)", data: [] }] },
        options: { responsive: true }
    });
}

// ALARME + DATEN LADEN
async function loadData() {
    const res = await fetch("/data");
    const json = await res.json();
    const plants = json.plants;

    const container = document.getElementById("plants");
    container.innerHTML = "";

    const hour = new Date().getUTCHours();

    // Diagramme updaten (Anlage 1 Beispiel)
    const p = plants[0];

    kwChart.data.labels.push(p.timestamp);
    kwChart.data.datasets[0].data.push(p.kw);
    kwChart.update();

    voltChart.data.labels.push(p.timestamp);
    voltChart.data.datasets[0].data.push(p.voltage);
    voltChart.update();

    tempChart.data.labels.push(p.timestamp);
    tempChart.data.datasets[0].data.push(p.temperature);
    tempChart.update();

    plants.forEach(p => {
        let css = "plant";

        // PV-Grenzwerte
        if (p.temperature > 55) css += " alarm";          // Gefährlich
        else if (p.temperature > 50) css += " warning";   // Warnung

        if (p.voltage < 450) css += " alarm";
        else if (p.voltage < 500) css += " warning";

        if (p.kw < 0.2 && hour >= 7 && hour <= 17) css += " warning";

        container.innerHTML += `
            <div class="${css}">
                <h2>Anlage ${p.plant_id}</h2>
                <p><b>Leistung:</b> ${p.kw} kW</p>
                <p><b>Spannung:</b> ${p.voltage} V</p>
                <p><b>Temperatur:</b> ${p.temperature} °C</p>
                <p><small>${p.timestamp}</small></p>
            </div>
        `;
    });
}

setupCharts();
setInterval(loadData, 2000);
loadData();


