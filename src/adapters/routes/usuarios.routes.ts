import {Router} from 'express';
import { UserController} from '../controllers/usuarioController';
import { validarUsuario } from '../middlewares/validarUsuario';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const userController = new UserController();

router.post('/', validarUsuario, userController.crearUsuario);
router.get('/:id', authMiddleware, userController.obtenerUsuarioPorId);
router.put('/:id', authMiddleware, validarUsuario, userController.actualizarUsuario);
router.delete('/:id', authMiddleware, userController.eliminarUsuario);
router.post('/login', userController.loginUsuario);

export default router;

