async function loadData() {
    const res = await fetch("/data");
    const json = await res.json();
    const plants = json.plants;

    const container = document.getElementById("plants");
    container.innerHTML = "";

    const hour = new Date().getUTCHours();

    plants.forEach(p => {
        let css = "plant";

        // Alarmbedingungen
        if (p.temperature > 50) css += " alarm";
        else if (p.voltage < 500) css += " warning";
        else if (p.kw < 1 && hour >= 7 && hour <= 17) css += " warning";

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

// Aktualisiert alle 2 Sekunden automatisch
setInterval(loadData, 2000);
loadData();
