import { Router } from 'express';
import { sendMessageController } from '../controllers/messageController';

const router = Router();

router.post('/send-message', sendMessageController);

export default router;
