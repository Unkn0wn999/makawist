const pool = require('../Db/connection'); // ✅ Tu conexión real

// 📊 Ventas mensuales (gráfico de barras)
exports.ventasMensuales = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT MONTH(Fecha) AS mes, SUM(Total) AS total
FROM Ventas
WHERE YEAR(Fecha) = YEAR(CURDATE())
GROUP BY mes ORDER BY mes

    `);

    const labels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const data = Array(12).fill(0);

    results.forEach(row => {
      data[row.mes - 1] = row.total;
    });

    res.json({ labels, data });
  } catch (err) {
    console.error("❌ Error al obtener ventas mensuales:", err);
    res.status(500).json({ error: 'Error al obtener ventas mensuales' });
  }
};

// 📈 Categorías más vendidas (gráfico de torta)
exports.topCategorias = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT c.Nombre AS categoria, SUM(dp.Cantidad) AS total
      FROM DetallePedido dp
      JOIN Productos p ON dp.IdProducto = p.IdProducto
      JOIN Categorias c ON p.IdCategoria = c.IdCategoria
      GROUP BY c.Nombre ORDER BY total DESC LIMIT 5
    `);

    const labels = results.map(row => row.categoria);
    const data = results.map(row => row.total);

    res.json({ labels, data });
  } catch (err) {
    console.error("❌ Error al obtener top categorías:", err);
    res.status(500).json({ error: 'Error al obtener top categorías' });
  }
};
