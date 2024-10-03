import mongoose, { Schema, Document } from 'mongoose';

interface INotification extends Document {
    resource: string;
    topic: string;
    data: any;
    date_created: Date | null;
}

const NotificationSchema: Schema = new Schema({
    resource: { type: String, required: true },
    topic: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: null },
    date_created: { type: Date, default: null }
});

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;