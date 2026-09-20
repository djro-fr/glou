import type { FountainFilters } from '../DTO/fountainFilters.ts';
import {getAllFountainsService, getFountainByIdService} from '../Service/fountainService.ts'

import { type Request, type Response } from 'express';

export async function getAllFountainsController(req: Request, res: Response) {
   const filters : FountainFilters = {
    city: (typeof req.query.city === 'string') ? req.query.city : undefined, 
    district: (typeof req.query.district === 'string') ? req.query.district : undefined, 
    type: (typeof req.query.type === 'string') ? req.query.type : undefined, 
    status: (typeof req.query.status === 'string') ? req.query.status : undefined, 
  } 
  const result = await getAllFountainsService(filters);
  res.send(result);
}

export async function getFountainByIdController(req: Request, res: Response) {
  const result = await getFountainByIdService(Number(req.params.id));
  res.send(result);
}
