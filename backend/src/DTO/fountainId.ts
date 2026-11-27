import { z } from 'zod';

// Max value of a PostgreSQL INTEGER (fountain.id)
const PG_INTEGER_MAX = 2147483647;

export const fountainIdSchema = z.strictObject({
  id: z.coerce.number("L'identifiant doit être un numéro")
    .int("L'identifiant doit être un entier")
    .positive("L'identifiant doit être positif")
    .max(PG_INTEGER_MAX, "L'identifiant est trop grand"),
});

export type FountainId = z.infer<typeof fountainIdSchema>;
