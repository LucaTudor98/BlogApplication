import { NextFunction, Request, Response } from 'express';
import Jwt from 'jsonwebtoken';

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = Buffer.from(base64, 'base64').toString();
  return JSON.parse(jsonPayload);
}

const authenticateHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1] as string;
  if (token) {
    try {
      Jwt.verify(token, process.env.TOKEN_SECRET as string);
      const decodedToken = parseJwt(token);
      req.userId = decodedToken.user.id;
      req.isAdmin = decodedToken.user.isAdmin;

      next();
      return;
    } catch (err) {
      res.status(401).json({ message: err });
      return;
    }
  }

  req.isAdmin = false;
  next();
};
export default authenticateHandler;
