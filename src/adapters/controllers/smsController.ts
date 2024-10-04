import { Request, Response } from 'express';
import { sendSms } from '../../application/services/twilioService';

export const sendSmsController = async (req: Request, res: Response) => {
    const { to, body } = req.body;

    try {
        const message = await sendSms(to, body);
        return res.status(200).json({
            message: 'SMS sent successfully',
            data: message,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to send SMS',
            error: (error as Error).message,
        });
    }
};
