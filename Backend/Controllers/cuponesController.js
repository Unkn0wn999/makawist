const Cupon = require('../Models/cuponModel');

exports.listarCuponesActivos = async (req, res) => {
  try {
    const cupones = await Cupon.obtenerActivos();
    res.json(cupones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cupones activos' });
  }
};

exports.listarTodosCupones = async (req, res) => {
  try {
    const cupones = await Cupon.obtenerTodos();
    res.json(cupones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todos los cupones' });
  }
};

exports.validarCupon = async (req, res) => {
  try {
    const codigo = req.query.codigo?.toUpperCase();
    const cupon = await Cupon.obtenerPorCodigo(codigo);
    if (!cupon) return res.status(404).json({ valido: false, mensaje: 'Cupón no válido o no activo' });

    // Devuelve el formato que el frontend espera
    res.json({
      valido: true,
      descuento: parseFloat(cupon.Descuento),
      tipo: 'porcentaje', // o 'fijo', dependiendo del diseño de tu base de datos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valido: false, mensaje: 'Error al validar cupón' });
  }
};


exports.crearCupon = async (req, res) => {
  try {
    const nuevoCupon = req.body;
    const id = await Cupon.crear(nuevoCupon);
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cupón' });
  }
};

exports.editarCupon = async (req, res) => {
  try {
    const id = req.params.id;
    const cuponEditado = req.body;
    const affectedRows = await Cupon.actualizar(id, cuponEditado);
    if (affectedRows === 0) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json({ message: 'Cupón actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cupón' });
  }
};

exports.eliminarCupon = async (req, res) => {
  try {
    const id = req.params.id;
    const affectedRows = await Cupon.eliminar(id);
    if (affectedRows === 0) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json({ message: 'Cupón eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cupón' });
  }
};

exports.contarCuponesActivos = async (req, res) => {
  try {
    const cupones = await Cupon.obtenerActivos();
    res.json({ total: cupones.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al contar cupones activos' });
  }
};

