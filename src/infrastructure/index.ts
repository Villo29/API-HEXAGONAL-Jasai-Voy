import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import router from '../adapters/routes/router';

dotenv.config();

const app = express();
const port = process.env.PORT || 3029;

// Configurar Mongoose
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('Conectado a la base de datos MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos MongoDB', error);
  });

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
