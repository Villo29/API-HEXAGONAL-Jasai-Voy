import { Request, Response } from 'express';
import Notification from '../../domain/models/notifation';

export class NotificationController {
    constructor() {}

    // Crear una nueva notificación si los datos no son nulos
    createNotification = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { action, api_version, data, date_created, id, live_mode, type, user_id } = req.body;

            // Validar que los campos requeridos no sean nulos
            if (!action || !api_version || !data?.id || !date_created || !id || live_mode === undefined || !type || !user_id) {
                return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados y no deben ser nulos' });
            }

            // Verificar si la notificación ya existe
            const existingNotification = await Notification.findOne({ notification_id: id });
            if (existingNotification) {
                return res.status(400).json({ message: 'La notificación ya existe en la base de datos' });
            }

            // Crear una nueva notificación con los datos proporcionados
            const newNotification = new Notification({
                action,
                api_version,
                data,
                date_created,
                notification_id: id,
                live_mode,
                type,
                user_id
            });
            const savedNotification = await newNotification.save();
            return res.status(201).json(savedNotification);
        } catch (error) {
            console.error('Error al crear la notificación:', error);
            return res.status(500).json({ message: 'Error al crear la notificación' });
        }
    };

    // Obtener todas las notificaciones
    getNotifications = async (_req: Request, res: Response): Promise<Response> => {
        try {
            const notifications = await Notification.find();
            return res.status(200).json(notifications);
        } catch (error) {
            console.error('Error al obtener las notificaciones:', error);
            return res.status(500).json({ message: 'Error al obtener las notificaciones' });
        }
    };

    // Obtener una notificación por ID
    getNotificationById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const notification = await Notification.findById(id);
            if (!notification) {
                return res.status(404).json({ message: 'Notificación no encontrada' });
            }
            return res.status(200).json(notification);
        } catch (error) {
            console.error('Error al obtener la notificación:', error);
            return res.status(500).json({ message: 'Error al obtener la notificación' });
        }
    };

    // Eliminar una notificación por ID
    deleteNotification = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const deletedNotification = await Notification.findByIdAndDelete(id);
            if (!deletedNotification) {
                return res.status(404).json({ message: 'Notificación no encontrada' });
            }
            return res.status(200).json({ message: 'Notificación eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la notificación:', error);
            return res.status(500).json({ message: 'Error al eliminar la notificación' });
        }
    }
}

export const createNotification = new NotificationController().createNotification;
export const getNotifications = new NotificationController().getNotifications;
export const getNotificationById = new NotificationController().getNotificationById;
export const deleteNotification = new NotificationController().deleteNotification;