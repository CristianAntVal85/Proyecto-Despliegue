import { Router } from 'express';
import Evento from '../models/evento.js';
import Recinto from '../models/recinto.js';

const router = Router();

// GET /eventos - Obtener todos los eventos con información de recinto
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find().populate('recinto');
    if (eventos && eventos.length > 0) {
      return res.status(200).json({ ok: true, resultado: eventos });
    }
    return res.status(500).json({ ok: false, error: 'No se han encontrado eventos' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'No se han encontrado eventos' });
  }
});

// GET /eventos/localidad/:nombre - Obtener eventos de una localidad cuya fecha aún no haya pasado
router.get('/localidad/:nombre', async (req, res) => {
  try {
    const recintos = await Recinto.find({ localidad: req.params.nombre });
    const idsRecintos = recintos.map((r) => r._id);

    const eventos = await Evento.find({
      recinto: { $in: idsRecintos },
      fecha: { $gte: new Date() }
    }).populate('recinto');

    if (eventos && eventos.length > 0) {
      return res.status(200).json({ ok: true, resultado: eventos });
    }
    return res.status(404).json({ ok: false, error: 'No se han encontrado eventos' });
  } catch (error) {
    return res.status(404).json({ ok: false, error: 'No se han encontrado eventos' });
  }
});

// GET /eventos/entradas/:idEvento/:tipoEntrada - Obtener precio y entradas disponibles
router.get('/entradas/:idEvento/:tipoEntrada', async (req, res) => {
  const { idEvento, tipoEntrada } = req.params;
  try {
    const evento = await Evento.findById(idEvento);
    if (!evento) {
      return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${idEvento}` });
    }

    const entrada = evento.entradas.find((e) => e.tipo === tipoEntrada);
    if (!entrada) {
      return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${idEvento}` });
    }

    return res.status(200).json({
      ok: true,
      resultado: {
        precio: entrada.precio,
        disponibles: entrada.disponibles
      }
    });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${idEvento}` });
  }
});

// PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad - Restar entradas disponibles
router.put('/entradas/:idEvento/:tipoEntrada/:cantidad', async (req, res) => {
  const { idEvento, tipoEntrada, cantidad } = req.params;
  try {
    const cantidadResta = parseInt(cantidad, 10);
    if (isNaN(cantidadResta) || cantidadResta <= 0) {
      return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${idEvento}` });
    }

    const evento = await Evento.findById(idEvento);
    if (!evento) {
      return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${idEvento}` });
    }

    const entrada = evento.entradas.find((e) => e.tipo === tipoEntrada);
    if (!entrada || entrada.disponibles < cantidadResta) {
      return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${idEvento}` });
    }

    entrada.disponibles -= cantidadResta;
    await evento.save();

    return res.status(200).json({ ok: true, resultado: evento });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${idEvento}` });
  }
});

// GET /eventos/:id - Obtener un evento por ID
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id).populate('recinto');
    if (!evento) {
      return res.status(404).json({ ok: false, error: `Evento ${req.params.id} no encontrado` });
    }
    return res.status(200).json({ ok: true, resultado: evento });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Evento ${req.params.id} no encontrado` });
  }
});

// POST /eventos - Añadir un nuevo evento
router.post('/', async (req, res) => {
  try {
    const nuevoEvento = new Evento(req.body);
    const eventoGuardado = await nuevoEvento.save();
    return res.status(201).json({ ok: true, resultado: eventoGuardado });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Error añadiendo evento' });
  }
});

// PUT /eventos/:id - Actualizar datos de un evento
router.put('/:id', async (req, res) => {
  try {
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!eventoActualizado) {
      return res.status(404).json({ ok: false, error: `Error actualizando evento ${req.params.id}` });
    }
    return res.status(200).json({ ok: true, resultado: eventoActualizado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error actualizando evento ${req.params.id}` });
  }
});

// DELETE /eventos/:id - Eliminar un evento por ID
router.delete('/:id', async (req, res) => {
  try {
    const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
    if (!eventoEliminado) {
      return res.status(404).json({ ok: false, error: `Error eliminando evento ${req.params.id}` });
    }
    return res.status(200).json({ ok: true, resultado: eventoEliminado });
  } catch (error) {
    return res.status(404).json({ ok: false, error: `Error eliminando evento ${req.params.id}` });
  }
});

export default router;
