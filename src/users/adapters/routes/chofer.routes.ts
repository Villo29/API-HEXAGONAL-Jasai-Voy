import {Router} from 'express';
import { driveController } from '../controllers/choferControllers';
import { validarChofer } from '../middlewares/validarChofer';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../../infrastructure/config/multerConfig';

const router = Router();
const choferController = new driveController();

router.post('/', upload.single('imagenPath'), validarChofer, choferController.crearChofer);
router.get('/:id', authMiddleware, choferController.obtenerChoferPorId);
router.put('/:id', authMiddleware, choferController.actualizarChofer);
router.delete('/:id', authMiddleware, choferController.eliminarChofer);
router.post('/login', choferController.loginChofer);
router.post('/validar-usuario', choferController.verificarCodigo);


export default router;
