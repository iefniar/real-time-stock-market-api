import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase } from './db/dbConnection.ts';
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
