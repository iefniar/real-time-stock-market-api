/*
import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(uri);

    mongoose.connection.on('error', (err) =>
      console.error('MongoDB error:', err)
    );

    console.log('Connected to DB');

    return mongoose.connection;
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    return null;
  }
}
*/
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}

const mongoUri: string = uri;

export const mongoClient = new MongoClient(mongoUri);

export async function connectToDatabase() {
  try {
    await Promise.all([
      mongoose.connect(mongoUri),
      mongoClient.connect(),
    ]);

    console.log("Connected to DB");
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
}
