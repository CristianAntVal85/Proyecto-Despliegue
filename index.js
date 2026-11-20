import express from 'express';
import mongoose from 'mongoose';
import recintosRouter from './routes/recintos.js';
import eventosRouter from './routes/eventos.js';

// Carga de variables de entorno desde .env
try {
  process.loadEnvFile();
} catch {
  // Ignorar si el archivo .env no existe
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventos';

// Middleware para procesar peticiones JSON
app.use(express.json());

// Montaje de enrutadores
app.use('/recintos', recintosRouter);
app.use('/eventos', eventosRouter);

// Conexión a la base de datos y arranque del servidor
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado a la base de datos MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message);
  });
