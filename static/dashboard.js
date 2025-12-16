async function fetchData() {
  const res = await fetch("/data");
  return await res.json();
}

// === kW Chart ===
const kwCtx = document.getElementById("kwChart").getContext("2d");
const kwChart = new Chart(kwCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Anlage 1 (kW)", data: [], borderWidth: 2 },
      { label: "Anlage 2 (kW)", data: [], borderWidth: 2 },
      { label: "Anlage 3 (kW)", data: [], borderWidth: 2 }
    ]
  }
});

// === Volt Chart ===
const voltCtx = document.getElementById("voltChart").getContext("2d");
const voltChart = new Chart(voltCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Anlage 1 (V)", data: [], borderWidth: 2 },
      { label: "Anlage 2 (V)", data: [], borderWidth: 2 },
      { label: "Anlage 3 (V)", data: [], borderWidth: 2 }
    ]
  }
});

// === Temperatur Chart ===
const tempCtx = document.getElementById("tempChart").getContext("2d");
const tempChart = new Chart(tempCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Anlage 1 (°C)", data: [], borderWidth: 2 },
      { label: "Anlage 2 (°C)", data: [], borderWidth: 2 },
      { label: "Anlage 3 (°C)", data: [], borderWidth: 2 }
    ]
  }
});

async function updateCharts() {
  const json = await fetchData();
  const plants = json.plants;
  const time = new Date(plants[0].timestamp).toLocaleTimeString();

  [kwChart, voltChart, tempChart].forEach(chart => chart.data.labels.push(time));

  kwChart.data.datasets[0].data.push(plants[0].kw);
  kwChart.data.datasets[1].data.push(plants[1].kw);
  kwChart.data.datasets[2].data.push(plants[2].kw);

  voltChart.data.datasets[0].data.push(plants[0].voltage);
  voltChart.data.datasets[1].data.push(plants[1].voltage);
  voltChart.data.datasets[2].data.push(plants[2].voltage);

  tempChart.data.datasets[0].data.push(plants[0].temperature);
  tempChart.data.datasets[1].data.push(plants[1].temperature);
  tempChart.data.datasets[2].data.push(plants[2].temperature);

  [kwChart, voltChart, tempChart].forEach(chart => {
    if (chart.data.labels.length > 20) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds => ds.data.shift());
    }
    chart.update();
  });
}

setInterval(updateCharts, 2000);
