import Message from '../models/message';

export interface IMessageRepository {
    sendMessage(message: Partial<Message>): Promise<void>;
}

export class MessageRepository implements IMessageRepository {
    async sendMessage(message: Partial<Message>): Promise<void> {
        try {
            await Message.create({
                ...message,
                to: message.to ?? '',
                templateName: message.templateName ?? '',
                languageCode: message.languageCode ?? '',
            });
        } catch (error) {
            throw new Error('Failed to save message: ' + (error as Error).message);
        }
    }
}

export default MessageRepository;
