import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    payment_id: {
        type: Number,
        required: true,
        unique: true
    },
    status_detail: {
        type: String,
        required: true
    },
    currency_id: {
        type: String,
        required: true
    },
    total_paid_amount: {
        type: Number,
        required: true
    },
    date_created: {
        type: Date,
        default: Date.now
    }
});

const PaymentModel = mongoose.model('Payment', PaymentSchema);

export default PaymentModel;
