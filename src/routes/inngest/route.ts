import { serve } from "inngest/express";
import { inngest } from "../../lib/inngest/client.ts";
import { sendDailyNewsSummary, sendSignUpEmail } from "../../lib/inngest/functions.ts";

export const inngestHandler = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary]
});
