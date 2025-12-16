const ctx = document.getElementById("powerChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "PV Anlage 1 (kW)",
        data: [],
        borderWidth: 2
      },
      {
        label: "PV Anlage 2 (kW)",
        data: [],
        borderWidth: 2
      },
      {
        label: "PV Anlage 3 (kW)",
        data: [],
        borderWidth: 2
      }
    ]
  }
});

async function updateChart() {
  const res = await fetch("/data");
  const json = await res.json();

  const plants = json.plants;
  const time = new Date(plants[0].timestamp).toLocaleTimeString();

  chart.data.labels.push(time);

  chart.data.datasets[0].data.push(plants[0].kw);
  chart.data.datasets[1].data.push(plants[1].kw);
  chart.data.datasets[2].data.push(plants[2].kw);

  if (chart.data.labels.



