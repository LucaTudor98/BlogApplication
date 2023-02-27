import { NextFunction, Request, Response } from 'express';
import Services from '../services/services';

const checkDbConfig = (_req: Request, res: Response, next: NextFunction) => {
  const dbService = Services.getDBService();
  if (!dbService.isConfigured()) {
    res.status(404).json({ error: 'Database is not configured!' });
    return;
  }
  next();
};

export default checkDbConfig;
