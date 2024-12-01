import https from 'https';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from '../adapters/routes/index';

dotenv.config();

const app = express();
const port = process.env.PORT || '';
const httpPort = 80; // Puerto HTTP para redirección
const httpsPort = process.env.PORTU || 443; // Puerto HTTPS

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado.');
    process.exit(1);
}


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta nuevamente después de 15 minutos.'
});


app.use(express.json());
app.use(cors());
app.use('/api', apiLimiter, routes);


import http from 'http';
http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(httpPort, () => {
    console.log(`Servidor HTTP redirigiendo al puerto HTTPS ${httpsPort}`);
});

// Configurar HTTPS
const httpsOptions = {
    cert: fs.readFileSync('/etc/letsencrypt/archive/jasai.site/fullchain1.pem'),
    key: fs.readFileSync('/etc/letsencrypt/archive/jasai.site/privkey1.pem')
};


https.createServer(httpsOptions, app).listen(httpsPort, () => {
    console.log(`Servidor HTTPS corriendo en el puerto ${httpsPort}`);
});




app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app };
