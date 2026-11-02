import type { ContactInput } from '../DTO/contactSchema.ts';
import {sendContactEMail} from '../Repository/contactRepository.ts'

export async function sendContactEMailService(input: ContactInput){     
  const { name, email, subject, message } = input;
  return await sendContactEMail(name, email, subject, message);    
}
