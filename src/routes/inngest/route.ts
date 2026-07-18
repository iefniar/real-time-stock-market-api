import { serve } from "inngest/express";
import { inngest } from "../../lib/inngest/client.ts";
import { sendSignUpEmail, sendEmailsToUsersWithNewsEnabled } from "../../lib/inngest/functions.ts";

export const inngestHandler = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendEmailsToUsersWithNewsEnabled]
});
