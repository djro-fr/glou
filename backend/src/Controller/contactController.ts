import { contactSchema } from '../DTO/contactSchema.ts';
import {sendContactEMailService} from '../Service/contactService.ts'

import { type Request, type Response } from 'express';

export async function sendContactEMailController(req: Request, res: Response) {  
  let data;
  try {
    data = contactSchema.parse(req.body);
  } catch (err) {
    res.status(400).json({ error: "Champs non valides" });
    return; 
  }
  try {
    await sendContactEMailService(data.name, data.email, data.subject, data.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur pendant l'envoi de l'e-mail" });
  }
}
