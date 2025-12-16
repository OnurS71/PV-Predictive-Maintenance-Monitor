const charts = {};
const maps = {};

function createLineChart(ctx, label) {
  return new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label, data: [], borderWidth: 2, pointRadius: 0 }] },
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
        <p>${p.city} | ${p.type} | ${p.kwp} kWp</p>

        <div id="map-${p.id}" class="map"></div>

        <div class="charts">
          <div class="chartbox"><canvas id="pow-${p.id}"></canvas></div>
          <div class="chartbox"><canvas id="vol-${p.id}"></canvas></div>
          <div class="chartbox"><canvas id="tmp-${p.id}"></canvas></div>
        </div>
      `;
      container.appendChild(div);

      const map = L.map(`map-${p.id}`).setView([p.lat, p.lon], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([p.lat, p.lon]).addTo(map);
      maps[p.id] = map;

      charts[p.id] = {
        power: createLineChart(document.getElementById(`pow-${p.id}`), "Leistung (kW)"),
        voltage: createLineChart(document.getElementById(`vol-${p.id}`), "Spannung (V)"),
        temp: createLineChart(document.getElementById(`tmp-${p.id}`), "Temperatur (°C)")
      };
    }

    const t = new Date(p.timestamp).toLocaleTimeString();

    charts[p.id].power.data.labels.push(t);
    charts[p.id].power.data.datasets[0].data.push(p.actual_kw);

    charts[p.id].voltage.data.labels.push(t);
    charts[p.id].voltage.data.datasets[0].data.push(p.voltage);

    charts[p.id].temp.data.labels.push(t);
    charts[p.id].temp.data.datasets[0].data.push(p.temperature);

    Object.values(charts[p.id]).forEach(c => {
      if (c.data.labels.length > 30) {
        c.data.labels.shift();
        c.data.datasets[0].data.shift();
      }
      c.update();
    });
  });
}

update();
setInterval(update, 2000);
