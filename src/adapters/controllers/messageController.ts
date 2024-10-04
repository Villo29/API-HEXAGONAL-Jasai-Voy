import { Request, Response } from 'express';
import { SendMessageUseCase } from '../../application/use_cases/sendMessageUseCase';
import { WhatsAppService } from '../../infrastructure/whatsappService';

const messageRepository = new WhatsAppService();
const sendMessageUseCase = new SendMessageUseCase(messageRepository);

export const sendMessageController = async (req: Request, res: Response) => {
    const { to, templateName, languageCode } = req.body;

    try {
        await sendMessageUseCase.execute({ to, templateName, languageCode });
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: 'Failed to send message', error: errorMessage });
    }
};
