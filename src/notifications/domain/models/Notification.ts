import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true },
    service_type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
