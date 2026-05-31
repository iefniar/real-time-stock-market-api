/*
import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase } from './lib/db/dbConnection.ts';
import bodyParser from 'body-parser';

async function start() {
  // Load environment variables
  dotenv.config({
    path: "./.env",
  });
  
    // Connect to Database
  const db = await connectToDatabase();

  if (!db) {
    throw new Error('Database connection failed');
  }

  // Create a new express application
  const app = express();

  app.use(bodyParser.json());

  app.get('/', ( req, res ) => {
    res.send('Hello from express api');
  });

  app.listen(process.env.HTTP_PORT, () => {
    console.log('Server is running on port ' + process.env.HTTP_PORT);
  });
}

start();
*/

import "dotenv/config"; // To load the .env variables
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { connectToDatabase } from "./lib/db/dbConnection.ts";
import { auth } from "./lib/better-auth/auth.ts";

const app = express();

async function startServer() {
  await connectToDatabase();

  app.use(
    cors({
      origin: process.env.BETTER_AUTH_URL,
      credentials: true,
    })
  );

  app.all(
    "/api/auth/*splat",
    toNodeHandler(auth)
  );

  app.use(express.json());

  app.listen(process.env.HTTP_PORT, () => {
    console.log("Server running on port " + process.env.HTTP_PORT);
  });
}

startServer();
