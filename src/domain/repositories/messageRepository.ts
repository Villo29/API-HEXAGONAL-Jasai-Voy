import { Message } from '../models/message'; // Adjust the import path as necessary

export interface MessageRepository {
    sendMessage(message: Message): Promise<void>;
}
