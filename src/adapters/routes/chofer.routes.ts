import {Router} from 'express';
import { ChoferController} from '../controllers/choferControler';
import { validarUsuario } from '../middlewares/validarUsuario';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const choferController = new ChoferController();


router.post('/choferes', validarUsuario, choferController.crearChofer);
router.get('/choferes', authMiddleware, choferController.obtenerchofer);
router.get('/choferes/:id', authMiddleware, choferController.obtenerChoferPorId);
router.put('/choferes/:id', authMiddleware, validarUsuario, choferController.actualizarChofer);
router.delete('/choferes/:id', authMiddleware, choferController.eliminarChofer);


export default router;

