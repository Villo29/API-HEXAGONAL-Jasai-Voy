import { Twilio } from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;

export const sendWhatsAppMessage = async (to: string, body: string) => {
  try {
    const message = await client.messages.create({
      body: body,
      from: whatsappFrom,
      to: `whatsapp:${to}`
    });
    return message;
  } catch (error) {
    throw new Error(`Error sending WhatsApp message: ${(error as any).message}`);
  }
};
