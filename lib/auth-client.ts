import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth"; // your auth.ts

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(), // ← infers firstName, lastName from your auth config
  ],
});

export type Session = typeof authClient.$Infer.Session;