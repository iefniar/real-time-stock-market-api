/*
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "../db/dbConnection.ts";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
  if(authInstance) return authInstance;

  const mongoose = await connectToDatabase();
  const db = mongoose?.db;

  if(!db) throw new Error('MongoDB connection not found');

  authInstance = betterAuth({
    database: mongodbAdapter(db as any),
   
  });

  return authInstance;
}

export const auth = await getAuth();
*/

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { mongoClient } from "../db/dbConnection.ts";

export const auth = betterAuth({
  database: mongodbAdapter(
    mongoClient.db()
  ),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true
  },
});
