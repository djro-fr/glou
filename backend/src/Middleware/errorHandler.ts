import { type Request, type Response, type NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }
  console.error('Erreur serveur non gérée :', err);
  res.status(500).json({
    errors: [{ field: null, message: 'Une erreur interne est survenue. Merci de réessayer plus tard.' }],
  });
}