import express from 'express';
import dotenv from 'dotenv';

async function start() {

  // Load environment variables
  dotenv.config({
    path: "./.env",
  });

  // Create a new express application
  const app = express();

  app.get('/', ( req, res ) => {
    res.send('Hello from express api');
  });

  app.listen(process.env.HTTP_PORT, () => {
    console.log('Server is running on port ' + process.env.HTTP_PORT);
  });
}

start();
