async function fetchData() {
  const res = await fetch("/data");
  return await res.json();
}

const charts = {};
const maps = {};

function createPlantChart(ctx) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Ist-Leistung (kW)",
          data: [],
          borderColor: "#4ec9b0",
          borderWidth: 2,
          yAxisID: "yPower",
          pointRadius: 0
        },
        {
          label: "Soll-Leistung (kW)",
          data: [],
          borderColor: "#4ec9b0",
          borderDash: [6,6],
          borderWidth: 2,
          yAxisID: "yPower",
          pointRadius: 0
        },
        {
          label: "Spannung (V)",
          data: [],
          borderColor: "#569cd6",
          borderWidth: 2,
          yAxisID: "ySecondary",
          pointRadius: 0
        },
        {
          label: "Temperatur (°C)",
          data: [],
          borderColor: "#ce9178",
          borderWidth: 2,
          yAxisID: "ySecondary",
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        yPower: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Leistung (kW)" },
          ticks: { color: "#ccc" }
        },
        ySecondary: {
          type: "linear",
          position: "right",
          title: { display: true, text: "Spannung (V) / Temperatur (°C)" },
          grid: { drawOnChartArea: false },
          ticks: { color: "#ccc" }
        },
        x: { ticks: { color: "#ccc" } }
      },
      plugins: {
        legend: { labels: { color: "#ccc" } }
      }
    }
  });
}

async function update() {
  const json = await fetchData();
  const container = document.getElementById("plants");

  json.plants.forEach(p => {
    if (!charts[p.id]) {
      const div = document.createElement("div");
      div.className = `plant ${p.alarm}`;
      div.innerHTML = `
        <h2>${p.name} – Status: ${p.alarm}</h2>
        <div class="info">
          📍 ${p.location}<br>
          🏭 ${p.type}<br>
          ☀️ Ausrichtung: ${p.orientation}<br>
          📐 Neigung: ${p.tilt}°<br>
          ⚡ Leistung: ${p.peak_kwp} kWp
        </div>
        <div id="map-${p.id}" class="map"></div>
        <div class="chartbox">
          <canvas id="chart-${p.id}"></canvas>
        </div>
      `;
      container.appendChild(div);

      const map = L.map(`map-${p.id}`).setView([p.lat, p.lon], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      L.marker([p.lat, p.lon])
        .addTo(map)
        .bindPopup(`<b>${p.name}</b><br>${p.type}<br>${p.peak_kwp} kWp`);

      maps[p.id] = map;

      const ctx = document.getElementById(`chart-${p.id}`).getContext("2d");
      charts[p.id] = createPlantChart(ctx);
    }

    const chart = charts[p.id];
    const time = new Date(p.timestamp).toLocaleTimeString();

    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(p.actual_kw);
    chart.data.datasets[1].data.push(p.expected_kw);
    chart.data.datasets[2].data.push(p.voltage);
    chart.data.datasets[3].data.push(p.temperature);

    if (chart.data.labels.length > 25) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds => ds.data.shift());
    }

    chart.update();
  });
}

update();
setInterval(update, 2000);

window.addEventListener("resize", () => {
  Object.values(charts).forEach(c => c.resize());
});
