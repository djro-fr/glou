import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1,"Le nom doit avoir au moins 1 caractère").max(100),
  email: z.email("L'adresse e-mail n'est pas valide").max(254),
  subject: z.string().trim().min(5,"Le sujet doit avoir au moins 5 caractères").max(150)
    .regex(/^[^\r\n]*$/, "Le sujet ne doit pas contenir de retour à la ligne"),
  message: z.string().trim().min(10,"Le message doit avoir au moins 10 caractères").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const fieldLabels: Record<string, string> = {
  name: 'Nom',
  email: 'E-mail',
  subject: 'Sujet',
  message: 'Message',
};