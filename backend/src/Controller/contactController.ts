import { contactSchema, fieldLabels } from '../DTO/contactSchema.ts';
import { sendContactEMailService } from '../Service/contactService.ts';
import { type Request, type Response } from 'express';

const SUCCESS = { message: "Merci, votre message a bien été envoyé." };

export async function sendContactEMailController(req: Request, res: Response) {
  if (req.body?.website) {
    res.status(200).json(SUCCESS);
    return;
  }
  const result = contactSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(issue => {
      const field = issue.path[0] !== undefined ? String(issue.path[0]) : null;
      return {
        field,
        message: `${field ? fieldLabels[field] ?? field : "Formulaire"} : ${issue.message}`,
      };
    });
    res.status(400).json({ errors });
    return;
  }
  try {
    await sendContactEMailService(result.data); 
    res.status(200).json(SUCCESS);
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'e-mail :", err);
    res.status(500).json({
      errors: [{ field: null, message: "Une erreur est survenue lors de l'envoi. Merci de réessayer plus tard." }],
    });
  }
}