import { Router } from "express";
import { sendWelcomeVerificationEmail } from "../controllers/auth.controller.ts";

const router = Router();

router.post(
  "/sign-up",
  sendWelcomeVerificationEmail
);

export default router;
