import { Router } from 'express';
import Recinto from '../models/recinto.js';

const router = Router();

// GET /recintos - Obtener todos los recintos
router.get('/', async (req, res) => {
  try {
    const recintos = await Recinto.find();
    if (recintos && recintos.length > 0) {
      return res.status(200).json({ ok: true, resultado: recintos });
    }
    return res.status(500).json({ ok: false, error: 'No se han encontrado recintos' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'No se han encontrado recintos' });
  }
});

// GET /recintos/localidad/:nombre - Obtener recintos por localidad
router.get('/localidad/:nombre', async (req, res) => {
  try {
    const recintos = await Recinto.find({ localidad: req.params.nombre });
    if (recintos && recintos.length > 0) {
      return res.status(200).json({ ok: true, resultado: recintos });
    }
    return res.status(404).json({ ok: false, error: 'No se han encontrado recintos de la localidad indicada' });
  } catch (error) {
    return res.status(404).json({ ok: false, error: 'No se han encontrado recintos de la localidad indicada' });
  }
});

// GET /recintos/:id - Obtener un recinto por ID
router.get('/:id', async (req, res) => {
  try {
    const recinto = await Recinto.findById(req.params.id);
    if (!recinto) {
      return res.status(404).json({ ok: false, error: `Recinto ${req.params.id} no encontrado` });
    }
    return res.status(200).json({ ok: true, resultado: recinto });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Recinto ${req.params.id} no encontrado` });
  }
});

// POST /recintos - Añadir un nuevo recinto
router.post('/', async (req, res) => {
  try {
    const nuevoRecinto = new Recinto(req.body);
    const recintoGuardado = await nuevoRecinto.save();
    return res.status(201).json({ ok: true, resultado: recintoGuardado });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Error añadiendo recinto' });
  }
});

// DELETE /recintos/:id - Eliminar un recinto por ID
router.delete('/:id', async (req, res) => {
  try {
    const recintoEliminado = await Recinto.findByIdAndDelete(req.params.id);
    if (!recintoEliminado) {
      return res.status(404).json({ ok: false, error: `Error eliminando recinto ${req.params.id}` });
    }
    return res.status(200).json({ ok: true, resultado: recintoEliminado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error eliminando recinto ${req.params.id}` });
  }
});

export default router;
