import nodemailer from "nodemailer";
import { env } from "./env.ts";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true, 
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}

