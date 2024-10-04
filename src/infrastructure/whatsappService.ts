import axios from 'axios';
import { MessageRepository } from '../domain/repositories/messageRepository';
import { Message } from '../domain/models/message';
import * as dotenv from 'dotenv';

dotenv.config();

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER; // Usar este ID para la URL
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN; // Token de acceso
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`; // Cambiar v17.0 a v20.0

export class WhatsAppService implements MessageRepository {
    async sendMessage(message: Message): Promise<void> {
        try {
            const data = JSON.stringify({
                messaging_product: 'whatsapp',
                to: message.to,
                type: 'template',
                template: {
                    name: message.templateName,
                    language: {
                        code: message.languageCode,
                    },
                },
            });

            await axios({
                method: 'post',
                url: WHATSAPP_API_URL,
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                data: data, // El cuerpo de la petición como string JSON
            });

        } catch (error) {
            const err = error as any;
            console.error('Failed to send message', err.response?.data || err.message);
            throw new Error('Failed to send message');
        }
    }
}
