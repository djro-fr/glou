import { fountainFiltersSchema } from "../DTO/fountainFilters.ts";
import { fountainIdSchema } from "../DTO/fountainId.ts";
import {getAllFountainsService, getFountainByIdService} from '../Service/fountainService.ts'

import { type Request, type Response } from 'express';

export async function getAllFountainsController(req: Request, res: Response) {
  const result = fountainFiltersSchema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      if (issue.code === 'unrecognized_keys') {
        return {
          field: null,
          message: `Paramètre(s) inconnu(s) : ${issue.keys.join(', ')}`,
        };
      }
      return {
        field: String(issue.path[0]),
        message: issue.message,
      };
    });
    res.status(400).json({ errors });
    return;  
  }
  const fountains = await getAllFountainsService(result.data);
  res.json(fountains);
}
  

export async function getFountainByIdController(req: Request, res: Response) {
  const result = fountainIdSchema.safeParse(req.params);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: String(issue.path[0]),
      message: issue.message,
    }));
    res.status(400).json({ errors });
    return;
  }
  const fountain = await getFountainByIdService(result.data.id);
  if (!fountain) {
    res.status(404).json({
      errors: [{ field: null, message: 'Fontaine introuvable' }],
    });
    return;
  }
  res.json(fountain);
}
