import express from 'express';
import usuariosRoutes from './usuarios.routes';


const router = express.Router();

// Prefijo de versión
const apiVersion = '/v1';


router.use(`${apiVersion}/users`, usuariosRoutes);



export default router;
