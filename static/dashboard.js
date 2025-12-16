const charts = {};
const maps = {};

function lineChart(ctx, label) {
  return new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label, data: [], borderWidth: 2, pointRadius: 0 }] },
    options: { responsive:true, maintainAspectRatio:false }
  });
}

function dualChart(ctx) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Ist-Leistung (kW)", data: [], borderWidth: 2 },
        { label: "Soll-Leistung (kW)", data: [], borderDash:[6,6], borderWidth: 2 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false }
  });
}

async function update() {
  const res = await fetch("/data");
  const json = await res.json();
  const container = document.getElementById("plants");

  json.plants.forEach(p => {
    if (!charts[p.id]) {
      const div = document.createElement("div");
      div.className = `plant ${p.status}`;
      div.innerHTML = `
        <h2>${p.name} – ${p.status}</h2>
        <div class="info">
          ${p.city} | ${p.kwp} kWp<br>
          Abweichung: ${p.deviation}%<br>
          Health-Score: ${p.health_score}/100
        </div>

        <div id="map-${p.id}" class="map"></div>

        <div class="charts">
          <div class="chartbox"><canvas id="p-${p.id}"></canvas></div>
          <div class="chartbox"><canvas id="v-${p.id}"></canvas></div>
          <div class="chartbox"><canvas id="t-${p.id}"></canvas></div>
        </div>
      `;
      container.appendChild(div);

      const map = L.map(`map-${p.id}`).setView([p.lat, p.lon], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([p.lat, p.lon]).addTo(map);
      maps[p.id] = map;

      charts[p.id] = {
        power: dualChart(document.getElementById(`p-${p.id}`)),
        voltage: lineChart(document.getElementById(`v-${p.id}`), "Spannung (V)"),
        temp: lineChart(document.getElementById(`t-${p.id}`), "Temperatur (°C)")
      };
    }

    const t = new Date(p.timestamp).toLocaleTimeString();

    charts[p.id].power.data.labels.push(t);
    charts[p.id].power.data.datasets[0].data.push(p.actual_kw);
    charts[p.id].power.data.datasets[1].data.push(p.expected_kw);

    charts[p.id].voltage.data.labels.push(t);
    charts[p.id].voltage.data.datasets[0].data.push(p.voltage);

    charts[p.id].temp.data.labels.push(t);
    charts[p.id].temp.data.datasets[0].data.push(p.temperature);

    Object.values(charts[p.id]).forEach(c => {
      if (c.data.labels.length > 40) {
        c.data.labels.shift();
        c.data.datasets.forEach(d => d.data.shift());
      }
      c.update();
    });
  });
}

update();
setInterval(update, 2000);
