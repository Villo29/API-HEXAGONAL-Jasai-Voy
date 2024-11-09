import { Twilio } from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export const sendWhatsAppMessage = async (to: string, body: string) => {
    try {
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        console.log(`Enviando mensaje a: ${formattedTo}`);
        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: formattedTo
        });
        console.log('Mensaje enviado:', message.sid);
        return message;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error enviando mensaje de WhatsApp:', error.message);
            throw new Error(`Error sending WhatsApp message: ${error.message}`);
        } else {
            console.error('Error desconocido enviando mensaje de WhatsApp:', error);
            throw new Error('Error desconocido enviando mensaje de WhatsApp');
        }
    }
};
