import express from 'express';
import choferRoutes from './chofer.routes';
import usuariosRoutes from './usuarios.routes';
import unidadRoutes from './unidad.routes';
import nofificationRoutes from './mercadoPago.routes';
import  whatsappRoutes from './whatsapp.routes';
import mercadoPagoRoutes from './mercadoPago.routes'


const router = express.Router();

// Prefijo de versión
const apiVersion = '/v1';

// Rutas para choferes
router.use(`${apiVersion}/choferes`, choferRoutes);

router.use(`${apiVersion}/users`, usuariosRoutes);

router.use(`${apiVersion}/unidades`, unidadRoutes);

router.use(`${apiVersion}/notifications`, nofificationRoutes);

router.use(`${apiVersion}/send-whatsapp`, whatsappRoutes);

router.use(`${apiVersion}/mercado-pago`, mercadoPagoRoutes);


export default router;
