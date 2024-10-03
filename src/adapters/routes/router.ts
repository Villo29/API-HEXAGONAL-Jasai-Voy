import { Router } from 'express';
import { crearUsuario, obtenerUsuarios, obtenerUsuarioPorId, actualizarUsuario, eliminarUsuario, loginUsuario } from '../controllers/usuarioController';
import { validarUsuario } from '../middlewares/validarUsuario';
import { authMiddleware } from '../middlewares/authMiddleware';
import { crearEvento, obtenerEventos, obtenerEventosporID } from '../controllers/EventosController';
import CarritoRouter from './carrito';


const router = Router();

router.post('/usuarios', validarUsuario, crearUsuario);
router.get('/usuarios', authMiddleware, obtenerUsuarios);
router.get('/usuarios/:id', authMiddleware, obtenerUsuarioPorId);
router.put('/usuarios/:id', authMiddleware, validarUsuario, actualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, eliminarUsuario);
router.post('/usuarios/login', loginUsuario);
router.post('/eventos', crearEvento);
router.get('/eventos', obtenerEventos);
router.get('/eventos/:id',obtenerEventosporID);


router.use('/', CarritoRouter);

export default router;
