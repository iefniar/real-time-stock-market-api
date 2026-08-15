import mongoose, { Schema, model } from 'mongoose';
const WatchlistSchema = new Schema({
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    addedAt: { type: Date, default: Date.now },
    isNewsViaEmailActive: { type: Boolean, default: false }
}, { timestamps: false });
// Prevent duplicate symbols per user
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });
export const Watchlist = mongoose.models?.Watchlist ||
    model('Watchlist', WatchlistSchema, 'watchlist' // Better Auth collection name
    );
