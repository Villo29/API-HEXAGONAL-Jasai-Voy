import {Router} from 'express';
import { NotificationController } from '../controllers/notificationController';


const router = Router();
const NotifationController = new NotificationController();

router.post('/', NotifationController.createNotification);
router.get('/', NotifationController.getNotifications);
router.get('/:id', NotifationController.getNotificationById);
router.delete('/:id', NotifationController.deleteNotification);

export default router;