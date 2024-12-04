import express from 'express';
import usuariosRoutes from './usuarios.routes';
import choferRoutes from './chofer.routes'


const router = express.Router();

const apiVersion = '/v1';


router.use(`${apiVersion}/users`, usuariosRoutes);
router.use(`${apiVersion}/chofer`, choferRoutes)

export default router;
