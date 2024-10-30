import { Request, Response } from 'express';
import Payment from '../../domain/models/notifation';

export class NotificationController {
    constructor() {}

    // Crear una nueva notificación si los datos no son nulos
    createNotification = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { payment_id, status_detail, currency_id, total_paid_amount, date_created } = req.body;

            // Validar que los campos requeridos no sean nulos
            if (!payment_id || !status_detail || !currency_id || !total_paid_amount) {
                return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados y no deben ser nulos' });
            }

            // Verificar si el pago ya existe
            const existingPayment = await Payment.findOne({ where: { payment_id } });
            if (existingPayment) {
                return res.status(400).json({ message: 'El pago ya existe en la base de datos' });
            }

            // Crear un nuevo pago con los datos proporcionados
            const newPayment = await Payment.create({
                payment_id,
                status_detail,
                currency_id,
                total_paid_amount,
                date_created: date_created || new Date()
            });
            return res.status(201).json(newPayment);
        } catch (error) {
            console.error('Error al crear el pago:', error);
            return res.status(500).json({ message: 'Error al crear el pago' });
        }
    };

    // Obtener todos los pagos
    getNotifications = async (_req: Request, res: Response): Promise<Response> => {
        try {
            const payments = await Payment.findAll();
            return res.status(200).json(payments);
        } catch (error) {
            console.error('Error al obtener los pagos:', error);
            return res.status(500).json({ message: 'Error al obtener los pagos' });
        }
    };

    // Obtener un pago por ID
    getNotificationById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const payment = await Payment.findByPk(id);
            if (!payment) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            return res.status(200).json(payment);
        } catch (error) {
            console.error('Error al obtener el pago:', error);
            return res.status(500).json({ message: 'Error al obtener el pago' });
        }
    };

    // Eliminar un pago por ID
    deleteNotification = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const deletedPayment = await Payment.findByPk(id);
            if (!deletedPayment) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }

            await deletedPayment.destroy();
            return res.status(200).json({ message: 'Pago eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el pago:', error);
            return res.status(500).json({ message: 'Error al eliminar el pago' });
        }
    }
}

export const createNotification = new NotificationController().createNotification;
export const getNotifications = new NotificationController().getNotifications;
export const getNotificationById = new NotificationController().getNotificationById;
export const deleteNotification = new NotificationController().deleteNotification;
