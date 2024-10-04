import { Twilio } from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export const sendSms = async (to: string, body: string) => {
    try {
        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to,
        });
        return message;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error sending SMS: ${error.message}`);
        } else {
            throw new Error('Error sending SMS: Unknown error');
        }
    }
};
