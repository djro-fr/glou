import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const fileURL = new URL("../../.env", import.meta.url);
const result = config({ path: fileURLToPath(fileURL) });
if (result.error) console.warn("Fichier .env non trouvé :", fileURLToPath(fileURL));

const envSchema = z.object({
  SMTP_USER: z.email(),
  CONTACT_RECIPIENT: z.email(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),  
  SMTP_PASS: z.string().min(1)
});

export const env = envSchema.parse(process.env); 

