import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import rateLimit from 'express-rate-limit';
import routes from '../adapters/routes/index';

dotenv.config();

const app = express();
const port = process.env.PORT || '';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado.');
    process.exit(1);
}

const sequelize = new Sequelize(process.env.MYSQL_DB || '', process.env.MYSQL_USER || '', process.env.MYSQL_PASSWORD || '', {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
});

sequelize.authenticate()
    .then(() => {
        console.log('Conectado a la base de datos MySQL');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos MySQL', error);
    });

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta nuevamente después de 15 minutos.'
});

app.use(express.json());
app.use(cors());
app.use('/api', apiLimiter, routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app };
