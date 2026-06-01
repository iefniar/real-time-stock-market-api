import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "real-time-stock-market-app",
  ai: { gemini: { apiKey: process.env.GEMINI_API_KEY }}
});
