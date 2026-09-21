import { type Request, type Response, type NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message });
}