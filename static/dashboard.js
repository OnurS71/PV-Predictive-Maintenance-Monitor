console.log("dashboard.js loaded");

async function loadData() {
  const res = await fetch("/data");
  const json = await res.json();

  console.log("DATA:", json);

  const container = document.getElementById("plants");
  container.innerHTML = "";

  json.plants.forEach(p => {
    const div = document.createElement("div");
    div.className = "plant";

    div.innerHTML =
      "<h2>" + p.name + "</h2>" +
      "<p>Status: " + p.status + "</p>" +
      "<p>Ist-Leistung: " + p.actual_kw + " kW</p>" +
      "<p>Soll-Leistung: " + p.expected_kw + " kW</p>" +
      "<div class='chartbox'>" +
        "<canvas id='chart-" + p.id + "'></canvas>" +
      "</div>";

    container.appendChild(div);

    const ctx = document.getElementById("chart-" + p.id);

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["now"],
        datasets: [
          {
            label: "Ist-Leistung (kW)",
            data: [p.actual_kw],
            borderWidth: 2
          },
          {
            label: "Soll-Leistung (kW)",
            data: [p.expected_kw],
            borderDash: [6, 6],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  });
}

loadData();
