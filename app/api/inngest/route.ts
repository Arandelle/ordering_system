// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { myScheduledJob } from "@/inngest/functions/myScheduledJob";
import { expireOrder } from "@/inngest/functions/expireOrder";
import { cleanupAccounts } from "@/inngest/functions/cleanupAccounts";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [expireOrder, cleanupAccounts],
});