import mongoose, { Schema, Document } from 'mongoose';

interface INotification extends Document {
    action: string;
    api_version: string;
    data: {
        id: string;
    };
    date_created: Date;
    id: number;
    live_mode: boolean;
    type: string;
    user_id: string;
}

const NotificationSchema: Schema = new Schema({
    action: { type: String, required: true },
    api_version: { type: String, required: true },
    data: {
        id: { type: String, required: true }
    },
    date_created: { type: Date, required: true },
    id: { type: Number, required: true, unique: true },
    live_mode: { type: Boolean, required: true },
    type: { type: String, required: true },
    user_id: { type: String, required: true }
});

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;