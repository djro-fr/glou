import {sendContactEMail} from '../Repository/contactRepository.ts'

export async function sendContactEMailService(name: string, email: string, subject: string, message: string){     
  return await sendContactEMail(name, email, subject, message);    
}
