import { Message } from '../models/message';
export interface MessageRepository {
    sendMessage(message: Message): Promise<void>;
}
