import { serve } from "inngest/express";
import { inngest } from "../../lib/inngest/client.js";
import { resetEmailCounters, sendWelcomeVerificationEmail, sendEmailsToUsersWithNewsEnabled } from "../../lib/inngest/functions.js";

export const inngestHandler = serve({
  client: inngest,
  functions: [resetEmailCounters, sendWelcomeVerificationEmail, sendEmailsToUsersWithNewsEnabled]
});
