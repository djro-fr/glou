import { ZodError } from 'zod';
import { contactSchema, fieldLabels } from '../DTO/contactSchema.ts';
import { sendContactEMailService } from '../Service/contactService.ts';

import { type Request, type Response } from 'express';

export async function sendContactEMailController(req: Request, res: Response) {
  let data;
  try {
    data = contactSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.issues.map(issue =>  fieldLabels[String(issue.path[0])] + " : " +  issue.message); 
      res.status(400).json({ error: messages });
      return;
    }
    res.status(400).json({ error: "Champs non valides, merci de corriger" });
    return;
  }

  try {
    await sendContactEMailService(data.name, data.email, data.subject, data.message);
    res.json(data);
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'e-mail:", err);
    res.status(500).json({ error: "Une erreur est survenue lors de l'envoi de votre message. Merci de réessayer plus tard." });
  }
}