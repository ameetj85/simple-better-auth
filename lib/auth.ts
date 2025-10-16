import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma";
import { getResetPasswordEmailHtml } from "./email-template";
// If your Prisma file is located elsewhere, you can change the path

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      try {
        const emailHtml = getResetPasswordEmailHtml(user.email, url);

        // Send email using Resend
        const { resend, FROM_EMAIL } = await import("./resend");
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset your password",
          html: emailHtml,
        });
        if (error) {
          console.error("Error sending reset password email:", error);
          throw new Error("Failed to send reset password email.");
        } else {
          console.log("Reset password email sent to", user.email);
          console.log("Resend response data:", data);

          if (process.env.NODE_ENV === "development") {
            console.log("Reset URL (for development):", url);
          }
        }
      } catch (error) {
        console.error("Error generating reset password email HTML:", error);
        throw error;
      }
    },
  },
});
