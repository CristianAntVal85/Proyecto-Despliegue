import mongoose from 'mongoose';
import Evento from './models/evento.js';
import Recinto from './models/recinto.js';

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventos';

const recintos = [
  {
    _id: new mongoose.Types.ObjectId('650000000000000000000001'),
    nombre: 'Auditorio Central',
    direccion: 'Avenida del Parque 123',
    localidad: 'Madrid',
    aforoMaximo: 5000
  },
  {
    _id: new mongoose.Types.ObjectId('650000000000000000000002'),
    nombre: 'Sala del Puerto',
    direccion: 'Paseo Maritimo 45',
    localidad: 'Valencia',
    aforoMaximo: 1200
  },
  {
    _id: new mongoose.Types.ObjectId('650000000000000000000003'),
    nombre: 'Teatro del Norte',
    direccion: 'Calle Mayor numero 18',
    localidad: 'Bilbao',
    aforoMaximo: 800
  }
];

const daysFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const eventos = [
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000001'),
    nombre: 'Festival de Musica',
    fecha: daysFromToday(14),
    recinto: recintos[0]._id,
    entradas: [
      { tipo: 'General', precio: 35, disponibles: 2500 },
      { tipo: 'VIP', precio: 90, disponibles: 300 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000002'),
    nombre: 'Concierto de Verano',
    fecha: daysFromToday(30),
    recinto: recintos[1]._id,
    entradas: [
      { tipo: 'General', precio: 28, disponibles: 700 },
      { tipo: 'Premium', precio: 65, disponibles: 120 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('660000000000000000000003'),
    nombre: 'Noche de Teatro',
    fecha: daysFromToday(45),
    recinto: recintos[2]._id,
    entradas: [
      { tipo: 'General', precio: 22, disponibles: 500 },
      { tipo: 'Preferente', precio: 40, disponibles: 100 }
    ]
  }
];

try {
  await mongoose.connect(MONGODB_URI);

  for (const recinto of recintos) {
    await Recinto.updateOne(
      { _id: recinto._id },
      { $set: recinto },
      { upsert: true, runValidators: true }
    );
  }

  for (const evento of eventos) {
    await Evento.updateOne(
      { _id: evento._id },
      { $set: evento },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`Seed completado: ${recintos.length} recintos y ${eventos.length} eventos.`);
} catch (error) {
  console.error('Error al cargar los datos de ejemplo:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
