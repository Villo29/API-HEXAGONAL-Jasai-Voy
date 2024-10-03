import {Router} from 'express';
import { UnidadController } from '../controllers/unidadController';

const router = Router();
const unidadController = new UnidadController();

router.post('/', unidadController.crearUnidad);
router.get('/', unidadController.obtenerUnidades);
router.get('/:id', unidadController.obtenerUnidadPorId);
router.put('/:id', unidadController.actualizarUnidad);
router.delete('/:id', unidadController.eliminarUnidad);

export default router;