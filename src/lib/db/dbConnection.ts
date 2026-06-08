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
