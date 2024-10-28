import express from 'express';
import choferRoutes from './chofer.routes';
import usuariosRoutes from './usuarios.routes';
import unidadRoutes from './unidad.routes';
import nofificationRoutes from './mercadoPago.routes';
import  whatsappRoutes from './whatsapp.routes';

const router = express.Router();

// Prefijo de versión
const apiVersion = '/v1';

// Rutas para choferes
router.use(`${apiVersion}/choferes`, choferRoutes);

router.use(`${apiVersion}/users`, usuariosRoutes);

router.use(`${apiVersion}/unidades`, unidadRoutes);

router.use(`${apiVersion}/notifications`, nofificationRoutes);

router.use(`${apiVersion}/send-whatsapp`, whatsappRoutes);


export default router;
