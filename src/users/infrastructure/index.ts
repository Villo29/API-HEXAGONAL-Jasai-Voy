import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from '../adapters/routes/index';

dotenv.config();

const app = express();
const port = process.env.PORTU || '';


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

