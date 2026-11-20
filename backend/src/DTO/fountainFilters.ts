import { z } from 'zod';

export const fountainFiltersSchema = z.strictObject({
  city: z.string().trim().min(1,"Le nom de ville doit avoir au moins 1 caractère").max(20).optional(),
  district: z.coerce.number("Le quartier doit être un numéro").int().positive().optional(),
  type: z.string().trim().min(1).max(50).optional(),
  status: z.string().trim().min(1).max(50).optional(),
});

export type FountainFilters = z.infer<typeof fountainFiltersSchema>;