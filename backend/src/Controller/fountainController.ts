import { fountainFiltersSchema } from "../DTO/fountainFilters.ts";
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
  const result = await getFountainByIdService(Number(req.params.id));
  res.send(result);
}
