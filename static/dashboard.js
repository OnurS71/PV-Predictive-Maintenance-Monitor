const charts = {};

function baseOptions(label) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      y: {
        title: { display: true, text: label }
      }
    }
  };
}

function powerChart(ctx) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Ist-Leistung (kW)", data: [], borderWidth: 2, pointRadius: 0 },
        { label: "Soll-Leistung (kW)", data: [], borderDash: [6,6], borderWidth: 2, pointRadius: 0 }
      ]
    },
    options: baseOptions("Leistung (kW)")
  });
}

function voltageChart(ctx) {
  return new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label: "Spannung (V)", data: [] }] },
    options: baseOptions("Spannung (V)")
  });
}

function tempChart(ctx) {
  return new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label: "Temperatur (°C)", data: [] }] },
    options: baseOptions("Temperatur (°C)")
  });
}

async function update() {
  const res = await fetch("/data");
  const json = await res.json();
  const container = document.getElementById("plants");

  json.plants.forEach(p => {

    if (!charts[p.id]) {
      const div = document.createElement("div");
