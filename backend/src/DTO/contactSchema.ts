import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),  
  subject: z.string().min(5),
  message: z.string().min(10)
});