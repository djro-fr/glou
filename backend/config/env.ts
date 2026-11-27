import { z } from 'zod';

// The root .env is loaded by Node's --env-file flag in the npm scripts (see package.json),
// so this module only validates process.env.
const envSchema = z.object({
  // Defaults match the dev docker-compose.yml; docker-compose.prod.yml sets the internal service name and port
  POSTGRES_HOST: z.string().min(1).default('127.0.0.1'),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(5433),
  SMTP_USER: z.email(),
  CONTACT_RECIPIENT: z.email(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),  
  SMTP_PASS: z.string().min(1),
  CORS_ORIGINS: z.string()
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean))
    .pipe(z.array(z.url()).min(1))
    .refine(
      (origins) => origins.every((o) => new URL(o).origin === o),
      'Each origin must be scheme://host[:port], without path or trailing slash',
    ),
});

export const env = envSchema.parse(process.env); 

