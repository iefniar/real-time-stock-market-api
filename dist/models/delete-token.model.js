import mongoose, { Schema, model } from 'mongoose';
const DeleteTokenSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    encryptedToken: {
        type: String,
        required: true,
        unique: true
    },
    tokenLookupHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    iv: {
        type: String,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
export const DeleteToken = mongoose.models?.DeleteToken ||
    model('DeleteToken', DeleteTokenSchema, 'deleteToken');
