import { Request, Response } from 'express';
import { sendWhatsAppMessage } from '../../services/twilioService';
import Message from '../../domain/models/message';

export const sendWhatsAppController = async (req: Request, res: Response) => {
    const { to, templateName, languageCode } = req.body;

    try {

        const message = await sendWhatsAppMessage(to, templateName);

        const savedMessage = await Message.create({
            to,
            templateName,
            languageCode,w
        });

        return res.status(200).json({
            message: 'WhatsApp message sent successfully',
            data: savedMessage,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to send WhatsApp message',
            error: (error as Error).message,
        });
    }
};
