import fileUpload from 'express-fileupload';
import { app } from '../../infrastructure';

app.use(fileUpload({
    limits: { fileSize: 1 * 12288 * 12288 },
    abortOnLimit: true,
    responseOnLimit: 'El archivo es demasiado grande.',
}));
