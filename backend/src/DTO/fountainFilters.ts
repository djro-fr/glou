import { z } from 'zod';
import { PG_INTEGER_MAX } from './fountainId.ts';

export const fountainFiltersSchema = z.strictObject({
  city: z.string().trim().min(1,"Le nom de ville doit avoir au moins 1 caractère").max(20).optional(),
  district: z.coerce.number("Le quartier doit être un numéro")
    .int("Le quartier doit être un entier")
    .positive("Le quartier doit être positif")
    .max(PG_INTEGER_MAX, "Le numéro de quartier est trop grand")
    .optional(),
  type: z.string().trim().min(1).max(50).optional(),
  status: z.string().trim().min(1).max(50).optional(),
});

export type FountainFilters = z.infer<typeof fountainFiltersSchema>;