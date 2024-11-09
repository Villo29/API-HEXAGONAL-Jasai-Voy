import express from 'express';
import nofificationRoutes from './mercadoPago.routes';
import  whatsappRoutes from './whatsapp.routes';
import mercadoPagoRoutes from './mercadoPago.routes'


const router = express.Router();

// Prefijo de versión
const apiVersion = '/v1';

// Rutas para choferes
router.use(`${apiVersion}/notifications`, nofificationRoutes);

router.use(`${apiVersion}/send-whatsapp`, whatsappRoutes);

router.use(`${apiVersion}/mercado-pago`, mercadoPagoRoutes);


export default router;
