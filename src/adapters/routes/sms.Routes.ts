import { Router } from 'express';
import { sendSmsController } from '../controllers/smsController';

const router = Router();

router.post('/send-sms', sendSmsController);

export default router;