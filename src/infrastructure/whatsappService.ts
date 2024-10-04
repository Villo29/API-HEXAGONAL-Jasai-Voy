import axios from 'axios';
import { MessageRepository } from '../domain/repositories/messageRepository';
import { Message } from '../domain/models/message';
import * as dotenv from 'dotenv';

dotenv.config();

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

export class WhatsAppService implements MessageRepository {
    async sendMessage(message: Message): Promise<void> {
        try {
            await axios.post(
                WHATSAPP_API_URL,
                {
                    messaging_product: 'whatsapp',
                    to: message.to,
                    type: 'template',
                    template: {
                        name: message.templateName,
                        language: {
                            code: message.languageCode,
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error) {
            const err = error as any;
            console.error('Failed to send message', err.response?.data || err.message);
            throw new Error('Failed to send message');
        }
    }
}
