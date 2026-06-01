import { serve } from "inngest/express";
import { inngest } from "../../lib/inngest/client.ts";

export const inngestHandler = serve({
  client: inngest,
  functions: [],
});
