import { inngest } from "./client.ts";

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
    triggers: [
      {
        event: "app/user.created",
      },
    ],
  },

  async ({ event, step }) => {
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;
  }
);
