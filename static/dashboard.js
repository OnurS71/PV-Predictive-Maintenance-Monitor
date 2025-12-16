async function fetchData() {
  const res = await fetch("/data");
  return await res.json();
}

function createChart(ctx, labelSuffix) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: `Anlage 1 (${labelSuffix})`,
          data: [],
          borderWidth: 2,
          borderColor: "#4ec9b0",
          pointRadius: 0
        },
        {
          label: `Anlage 2 (${labelSuffix})`,
          data: [],
          borderWidth: 2,
          borderColor: "#569cd6",
          pointRadius: 0
        },
        {
          label: `Anlage 3 (${labelSuffix})`,
          data: [],
          borderWidth: 2,
          borderColor: "#ce9178",
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#ccc" }
        }
      }
    }
  });
}

/* Charts erstellen */
const kwChart = createChart(
  document.getElementById("kwChart").getContext("2d"),
  "kW"
);

const voltChart = createChart(
  document.getElementById("voltChart").getContext("2d"),
  "V"
);

const tempChart = createChart(
  document.getElementById("tempChart").getContext("2d"),
  "°C"
);

async function updateCharts() {
  const json = await fetchData();
  const plants = json.plants;
  const time = new Date(plants[0].timestamp).toLocaleTimeString();

  [kwChart, voltChart, tempChart].forEach(chart => {
    chart.data.labels.push(time);
  });

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

/* Initial + Live Update */
updateCharts();
setInterval(updateCharts, 2000);

/* Absicherung gegen Dark/Light/Resize-Bugs */
window.addEventListener("resize", () => {
  kwChart.resize();
  voltChart.resize();
  tempChart.resize();
});
