import "dotenv/config"; // To load the .env variables
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { connectToDatabase } from "./lib/db/dbConnection.ts";
import { auth } from "./lib/better-auth/auth.ts";
import { inngestHandler } from "./routes/inngest/route.ts";
import authRoutes from "./routes/auth.routes.ts";

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

  app.use(
    "/api/inngest",
    inngestHandler
  );

  app.use(
    "/api/auth",
    authRoutes
  );

  app.listen(process.env.HTTP_PORT, () => {
    console.log("Server running on port " + process.env.HTTP_PORT);
  });
}

startServer();
