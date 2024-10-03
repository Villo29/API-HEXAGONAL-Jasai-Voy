import express from 'express';
import choferRoutes from './chofer.routes';
import usuariosRoutes from './usuarios.routes';
import unidadRoutes from './unidad.routes';
import paympController from '../controllers/PaympController';

const router = express.Router();

// Prefijo de versión
const apiVersion = '/v1';

// Rutas para choferes
router.use(`${apiVersion}/choferes`, choferRoutes);

router.use(`${apiVersion}/users`, usuariosRoutes);

router.use(`${apiVersion}/unidades`, unidadRoutes);

router.use(`${apiVersion}/paymp`, paympController);

export default router;
