import fileUpload from 'express-fileupload';
import { app } from '../../infrastructure';

app.use(fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 }, // Limitar a 1MB
    abortOnLimit: true,
    responseOnLimit: 'El archivo es demasiado grande.',
}));
