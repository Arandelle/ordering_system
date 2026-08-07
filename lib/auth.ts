import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { render } from "@react-email/render";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { VerificationEmail } from "@/app/emails/VerificationEmail";
import { ForgotPasswordEmail } from "@/app/emails/ForgotPasswordEmail";
import { expo } from "@better-auth/expo"; // ✅ correct
import { GMAIL_DOMAIN } from "@/lib/isAllowedEmails";
import { isPasswordSecure, nameSchema } from "@/lib/validations";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      publicId: {
        type: "string",
        required: false,
      },
      termsAcceptedAt: {
        type: "string",
        required: false,
      },
      banned: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
      },
      scheduledDeletionAt: {
        type: "date",
        required: false,
      },
      deletionReason: {
        type: "string",
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    minPasswordLength: 8,

    // 🔹 SEND RESET EMAIL
    sendResetPassword: async ({ user, url }) => {
      const html = await render(
        ForgotPasswordEmail({
          user: user.name || "there",
          email: user.email,
          resetUrl: url, // full reset link
        }),
      );

      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Reset your password",
        html,
      });
    },

    // 🔹 AFTER PASSWORD RESET
    onPasswordReset: async ({ user }) => {
      console.log(`Password reset for ${user.email}`);
    },
  },

  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
  },

  emailVerification: {
    expiresIn: 60 * 15,
    callbackURL: "/verified",
    async sendVerificationEmail({ user, url }) {
      const html = await render(
        VerificationEmail({
          name: user.name || "there",
          verifyUrl: url,
          expiryMinutes: 15,
        }),
      );

      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Verify your email",
        html,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.given_name,
          lastName: profile.family_name,
          name:
            [profile.given_name, profile.family_name]
              .filter(Boolean)
              .join(" ") || profile.name,
          image: profile.picture,
        };
      },
      prompt: "select_account",
    },
  },

  plugins: [nextCookies(), expo()],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Validate email domain + password complexity + name rules + terms acceptance on customer signup
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as {
          email?: string;
          password?: string;
          firstName?: string;
          lastName?: string;
          termsAcceptedAt?: string;
        };

        // Validate names — reject emojis, special chars, numbers
        const firstNameResult = nameSchema.safeParse(body.firstName);
        if (!firstNameResult.success) {
          throw new APIError("BAD_REQUEST", {
            message: `First name: ${firstNameResult.error.issues[0].message}`,
          });
        }
        const lastNameResult = nameSchema.safeParse(body.lastName);
        if (!lastNameResult.success) {
          throw new APIError("BAD_REQUEST", {
            message: `Last name: ${lastNameResult.error.issues[0].message}`,
          });
        }

        const email = body.email?.trim().toLowerCase();
        if (email) {
          const domain = email.split("@")[1];
          if (domain !== GMAIL_DOMAIN) {
            throw new APIError("BAD_REQUEST", {
              message: `Only @${GMAIL_DOMAIN} email addresses are accepted`,
            });
          }
        }
        const password = body.password;
        if (password && !isPasswordSecure(password)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Password must be at least 8 characters with at least one uppercase letter, one number, and one symbol",
          });
        }
        if (!body.termsAcceptedAt) {
          throw new APIError("BAD_REQUEST", {
            message: "You must accept the Terms of Use and Privacy Policy to create an account",
          });
        }
      }

      // Validate name fields on customer profile update
      if (ctx.path === "/update-user") {
        const body = ctx.body as { firstName?: string; lastName?: string };
        if (body.firstName !== undefined) {
          const result = nameSchema.safeParse(body.firstName);
          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              message: `First name: ${result.error.issues[0].message}`,
            });
          }
        }
        if (body.lastName !== undefined) {
          const result = nameSchema.safeParse(body.lastName);
          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              message: `Last name: ${result.error.issues[0].message}`,
            });
          }
        }
      }

      // Validate email domain on customer email login + block banned accounts
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as { email?: string };
        const email = body.email?.trim().toLowerCase();
        if (email) {
          const domain = email.split("@")[1];
          if (domain !== GMAIL_DOMAIN) {
            throw new APIError("BAD_REQUEST", {
              message: `Only @${GMAIL_DOMAIN} email addresses are accepted`,
            });
          }

          // Block login for banned or soft-deleted customer accounts
          // Use raw MongoDB query to ensure all fields (including isDeleted) are returned
          const existingUser = await db.collection("user").findOne({ email }) as (Record<string, unknown> | null);
          if (existingUser && existingUser.banned === true) {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been suspended. Please contact support.",
            });
          }
          if (existingUser && existingUser.isDeleted === true) {
            throw new APIError("FORBIDDEN", {
              message: "ACCOUNT_SCHEDULED_FOR_DELETION",
              scheduledDeletionAt: existingUser.scheduledDeletionAt,
            });
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Auto-save termsAcceptedAt on first login (email sign-in & social/OAuth callback).
      // Only sets if the user doesn't already have a timestamp — preserves original acceptance date.
      const isEmailSignIn = ctx.path === "/sign-in/email";
      const isOAuthCallback = ctx.path.startsWith("/callback/");
      const isSocialIdToken = ctx.path === "/sign-in/social" && (ctx.context.returned as Record<string, unknown>)?.user;

      if (isEmailSignIn || isOAuthCallback || isSocialIdToken) {
        const userId =
          ctx.context.newSession?.user?.id ||
          ((ctx.context.returned as Record<string, unknown>)?.user as Record<string, unknown>)?.id as string | undefined;

        if (userId) {
          // Check if termsAcceptedAt is already set — don't overwrite
          const existingUser = await ctx.context.internalAdapter.findUserById(userId) as (Record<string, unknown> | null);
          if (existingUser && !existingUser.termsAcceptedAt) {
            await ctx.context.internalAdapter.updateUser(userId, {
              termsAcceptedAt: new Date().toISOString(),
            });
          }
        }
      }

      // ── Block deleted users on social/OAuth sign-in + finalize Google restores ──
      // The before hook only guards /sign-in/email. OAuth callbacks and social
      // sign-in don't have the user's email until after the provider returns,
      // so we check here in the after hook once the session is created.
      if (isOAuthCallback || ctx.path === "/sign-in/social") {
        const userId = ctx.context.newSession?.user?.id;
        if (userId) {
          const user = await ctx.context.internalAdapter.findUserById(userId) as (Record<string, unknown> | null);

          if (user) {
            const isDeleted = user.isDeleted === true;
            const hasScheduledDeletion = user.scheduledDeletionAt != null;
            const hasDeletedAt = user.deletedAt != null;

            // Case 1: User is soft-deleted and NOT in restore mode → block sign-in
            // (isDeleted is still true — they didn't go through the restore endpoint)
            if (isDeleted && hasScheduledDeletion) {
              // Revoke the session that was just created
              await db.collection("session").deleteMany({ userId });
              throw new APIError("FORBIDDEN", {
                message: "ACCOUNT_SCHEDULED_FOR_DELETION",
                scheduledDeletionAt: user.scheduledDeletionAt,
                email: user.email,
              });
            }

            // Case 2: Restore-in-progress → finalize the restore
            // Detected by: isDeleted=false but deletion metadata still present.
            // This only happens when the restore endpoint temporarily unset isDeleted
            // and the user then completed Google sign-in.
            if (!isDeleted && hasScheduledDeletion && hasDeletedAt) {
              // Use internalAdapter to update — handles ID type conversion
              await ctx.context.internalAdapter.updateUser(userId, {
                isDeleted: false,
                deletedAt: null,
                scheduledDeletionAt: null,
                deletionReason: null,
              });
            }
          }
        }
      }
    }),
  },

  trustedOrigins: [
    "https://food.harrisoninasalbbq.com.ph",
    "http://localhost:3000",
    "http://localhost:3001",

    "harrison://",
    "harrison://*",

    // if testing in Expo Go
    "exp://",
    "exp://**",
  ],
});
