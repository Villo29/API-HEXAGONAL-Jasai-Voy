import {Router} from 'express';
import { UserController} from '../controllers/usuarioController';
import { validarUsuario } from '../middlewares/validarUsuario';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../../infrastructure/config/multerConfig';

const router = Router();
const userController = new UserController();

router.post('/', upload.single('imagenPath'), validarUsuario, userController.crearUsuario);
router.get('/:id', authMiddleware, userController.obtenerUsuarioPorId);
router.put('/:id', authMiddleware, userController.actualizarUsuario);
router.delete('/:id', authMiddleware, userController.eliminarUsuario);
router.post('/login', userController.loginUsuario);
router.post('/validar-usuario', userController.verificarCodigo);

export default router;

