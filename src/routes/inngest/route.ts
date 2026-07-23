import { serve } from "inngest/express";
import { inngest } from "../../lib/inngest/client.ts";
import { sendWelcomeVerificationEmail, sendEmailsToUsersWithNewsEnabled } from "../../lib/inngest/functions.ts";

export const inngestHandler = serve({
  client: inngest,
  functions: [sendWelcomeVerificationEmail, sendEmailsToUsersWithNewsEnabled]
});
