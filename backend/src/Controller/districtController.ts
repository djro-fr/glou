import {getAllDistrictsService} from '../Service/districtService.ts'

import { type Request, type Response } from 'express';

export async function getAllDistrictsController(req: Request, res: Response) {
  const result = await getAllDistrictsService();
  res.send(result);
}
