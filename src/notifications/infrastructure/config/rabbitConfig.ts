import * as dotenv from 'dotenv';

dotenv.config();

export const RABBITMQ_URL = process.env.RABBITMQ_URL || '';