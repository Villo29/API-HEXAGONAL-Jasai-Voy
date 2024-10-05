import { Router } from 'express';
import { sendWhatsAppController } from '../controllers/whatsappController';

const router = Router();

router.post('/', sendWhatsAppController);

export default router;
