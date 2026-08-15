import mongoose, { Schema, model } from 'mongoose';
const UserSchema = new Schema({
    email: String,
    name: String,
    emailVerified: Boolean,
    country: String,
    investmentGoals: String,
    riskTolerance: String,
    preferredIndustry: String
}, {
    timestamps: true, //matches Better Auth's createdAt and updatedAt
    strict: false //lets Better Auth continue storing any fields it wants
});
export const User = mongoose.models?.User ||
    model('User', UserSchema, 'user' // Better Auth collection name
    );
