let chartVentas = null;
let chartCategorias = null;

function renderCharts() {
  fetchVentasMensuales();
  fetchTopCategorias();
}

function fetchVentasMensuales() {
  fetch('/api/dashboard/ventas-mensuales')
    .then(res => res.json())
    .then(({ labels, data }) => {
      const ctx = document.getElementById('areaChart').getContext('2d');

      // ✅ Destruir instancia anterior si existe
      if (chartVentas) chartVentas.destroy();

      chartVentas = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Ventas (S/.)',
            data,
            backgroundColor: 'rgba(255, 105, 180, 0.6)',
            borderColor: 'hotpink',
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: value => `S/ ${value}`
              }
            }
          }
        }
      });
    });
}

function fetchTopCategorias() {
  fetch('/api/dashboard/top-categorias')
    .then(res => res.json())
    .then(({ labels, data }) => {
      const ctx = document.getElementById('pieChart').getContext('2d');

      // ✅ Destruir instancia anterior si existe
      if (chartCategorias) chartCategorias.destroy();

      chartCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            label: 'Categorías',
            data,
            backgroundColor: [
              '#4bc0c0', '#36a2eb', '#ffcd56', '#ff6384', '#a84de3'
            ],
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                boxWidth: 15
              }
            }
          }
        }
      });
    });
}
