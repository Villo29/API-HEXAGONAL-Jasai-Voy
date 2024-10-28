import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from '../adapters/routes/index';

dotenv.config();

const app = express();
const port = process.env.PORT || 3029;

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado.');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || '')
    .then(() => {
        console.log('Conectado a la base de datos MongoDB');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos MongoDB', error);
    });


app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app };