import {Router} from 'express';
import { ChoferController} from '../controllers/choferControler';
import { validarUsuario } from '../middlewares/validarUsuario';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const choferController = new ChoferController();


router.post('/', validarUsuario, choferController.crearChofer);
router.get('/', authMiddleware, choferController.obtenerChoferes);
router.get('//:id', authMiddleware, choferController.obtenerChoferPorId);
router.put('//:id', authMiddleware, validarUsuario, choferController.actualizarChofer);
router.delete('//:id', authMiddleware, choferController.eliminarChofer);


export default router;

