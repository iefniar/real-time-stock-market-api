import { Router } from "express";
import { signUpWithEmail } from "../controllers/auth.controller.ts";

const router = Router();

router.post(
  "/sign-up",
  signUpWithEmail
);

export default router;
