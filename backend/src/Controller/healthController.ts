import { checkHealthService } from '../Service/healthService.ts';
import { type Request, type Response } from 'express';

// A database failure throws and is turned into a 500 by the error handler
export async function healthController(_req: Request, res: Response) {
  await checkHealthService();
  res.json({ status: 'ok' });
}
