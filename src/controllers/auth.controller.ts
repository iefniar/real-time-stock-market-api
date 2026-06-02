import { Request, Response } from "express";
import { auth } from "../lib/better-auth/auth.ts";
import { inngest } from "../lib/inngest/client.ts";

export async function signUpWithEmail(
  req: Request,
  res: Response
) {
  try {
    const {
      email,
      password,
      fullName,
      country,
      investmentGoals,
      riskTolerance,
      preferredIndustry,
    } = req.body;

    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
      },
    });

    await inngest.send({
        name: "app/user.created",
        data: {
            email,
            name: fullName,
            country,
            investmentGoals,
            riskTolerance,
            preferredIndustry,
        },
    });
    
    return res.status(201).json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error("Sign up failed:", error);

    return res.status(500).json({
      success: false,
      error: "Sign up failed",
    });
  }
}
