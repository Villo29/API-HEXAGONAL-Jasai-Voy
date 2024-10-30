import { Request, Response } from 'express';
import { sendWhatsAppMessage } from '../../services/twilioService';

export const sendWhatsAppController = async (req: Request, res: Response) => {
    const { to, body } = req.body;

    try {
        const message = await sendWhatsAppMessage(to, body);
        return res.status(200).json({
            message: 'WhatsApp message sent successfully',
            data: message,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to send WhatsApp message',
            error: (error as Error).message,
        });
    }
};
