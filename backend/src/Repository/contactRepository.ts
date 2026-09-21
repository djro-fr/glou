import { transporter } from '../../config/transporter.ts';

export async function sendContactEMail(name: string, email: string, subject: string, message: string) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    replyTo: email,
    to: process.env.SMTP_USER, 
    subject: subject, 
    text: `Nom: ${name}\nEmail: ${email}\nMessage: ${message}`, 
  });
  return info;
}
