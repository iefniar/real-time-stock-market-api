import mongoose, { Schema, model } from 'mongoose';
const EmailRateLimitSchema = new Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});
export const EmailRateLimit = mongoose.models?.EmailRateLimit ||
    model('EmailRateLimit', EmailRateLimitSchema, 'emailRateLimit' // mongodb collection name
    );
