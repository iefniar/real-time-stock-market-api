import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined');
}
const mongoUri = uri;
export const mongoClient = new MongoClient(mongoUri);
let mongoClientConnected = false;
export async function connectToDatabase() {
    const mongooseConnected = mongoose.connection.readyState === 1;
    if (mongooseConnected && mongoClientConnected) {
        return;
    }
    try {
        if (!mongooseConnected) {
            await mongoose.connect(mongoUri);
        }
        if (!mongoClientConnected) {
            await mongoClient.connect();
            mongoClientConnected = true;
        }
        console.log('Connected to DB');
    }
    catch (error) {
        console.error('Failed to connect to DB:', error);
        mongoClientConnected = false;
        throw error;
    }
}
