import mongoose, { Schema, Document } from 'mongoose';

interface INotification extends Document {
    action: string;
    api_version: string;
    data: {
        id: string | null;
    };
    date_created: Date | null;
    resource?: string;
    topic: string;
    id: number | null;
    live_mode: boolean | null;
    type: string | null;
}

const NotificationSchema: Schema = new Schema({
    action: { type: String, required: true },
    api_version: { type: String, required: true },
    data: {
        id: { type: String, default: null }
    },
    date_created: { type: Date, default: null },
    resource: { type: String },
    topic: { type: String, required: true },
    id: { type: Number, default: null },
    live_mode: { type: Boolean, default: null },
    type: { type: String, default: null }
});

NotificationSchema.index({ id: 1 }, { unique: true, partialFilterExpression: { id: { $type: 'number' } } });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;