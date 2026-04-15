document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("table tr").forEach((row, index) => {
    if (index === 0) return;

    const statusCell = row.children[4];
    const status = statusCell.innerText.trim();

    if (status === "Pending") {
      statusCell.style.color = "#ff4d4d";
      statusCell.style.fontWeight = "600";
      statusCell.style.animation = "pulse 1.5s infinite";
    } else if (status === "Ready") {
      statusCell.style.color = "#2ecc71";
      statusCell.style.fontWeight = "600";
    }
  });
});
// ===== Your existing JS code =====
console.log("Admin page loaded");
// other functions...

// ===== Pending / Ready Status Pulse =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("table tr").forEach((row, index) => {
    if (index === 0) return; // skip header

    const statusCell = row.children[4];
    const status = statusCell.innerText.trim();

    if (status === "Pending") {
      statusCell.style.color = "#ff4d4d";
      statusCell.style.fontWeight = "600";
      statusCell.style.animation = "pulse 1.5s infinite";
    } else if (status === "Ready") {
      statusCell.style.color = "#2ecc71";
      statusCell.style.fontWeight = "600";
      statusCell.style.animation = "none";
    }
  });
});
  // Chart example
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin JS loaded");

  // ===== STATUS COLOR LOGIC =====
  document.querySelectorAll("table tr").forEach((row, index) => {
    if (index === 0) return; // skip header
    const statusCell = row.children[4];
    if (!statusCell) return;
    const status = statusCell.innerText.trim();
    if (status === "Pending") {
      statusCell.style.color = "#ff4d4d";
      statusCell.style.fontWeight = "600";
    } else if (status === "Ready") {
      statusCell.style.color = "#2ecc71";
      statusCell.style.fontWeight = "600";
    }
  });

  // ===== ANIMATED DOUGHNUT CHART =====
  const canvas = document.getElementById("ordersChart");
  if (!canvas) return;

  const pending = Number(canvas.dataset.pending) || 0;
  const completed = Number(canvas.dataset.completed) || 0;

  console.log("Chart data:", pending, completed);

  new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Pending Orders", "Completed Orders"],
      datasets: [{
        label: "Orders",
        data: [pending, completed],
        backgroundColor: ["#ff9800", "#4caf50"],  // orange & green
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 20  // gives animation on hover
      }]
    },
    options: {
      responsive: true,
      cutout: "60%",  // makes doughnut look modern
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: "#333",
          titleColor: "#fff",
          bodyColor: "#fff"
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
});
const barCanvas = document.getElementById("topItemsBarChart");
  if(barCanvas){
      const items = barCanvas.dataset.items.split(",");
      const counts = barCanvas.dataset.counts.split(",").map(Number);

      new Chart(barCanvas, {
          type: "bar",
          data: {
              labels: items,
              datasets: [{
                  label: "Orders",
                  data: counts,
                  backgroundColor: "#9c27b0"
              }]
          },
          options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                  y: { beginAtZero: true }
              }
          }
      });
  }
  