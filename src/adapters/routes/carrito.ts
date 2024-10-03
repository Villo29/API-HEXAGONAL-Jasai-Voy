import { Router } from 'express';
import { agregarAlCarrito, obtenerCarrito, eliminarDelCarrito } from '../controllers/carritocontroller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/carrito', authMiddleware, agregarAlCarrito);
router.get('/carrito/:userId', authMiddleware, obtenerCarrito);
router.delete('/carrito/:id', authMiddleware, eliminarDelCarrito);

export default router;
