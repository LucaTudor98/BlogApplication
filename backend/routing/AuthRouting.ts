import express, { Request, Response } from 'express';
import OAuthServer from 'express-oauth-server';
import Jwt from 'jsonwebtoken';
import checkDbConfig from '../middleware/databaseConfig';
import model from '../authorization/accessTokenModel';

const oauth = new OAuthServer({
  model,
});

const routerAuth = express.Router();
routerAuth.use(express.urlencoded({ extended: true }));

routerAuth.use(checkDbConfig);

routerAuth.post('/token', oauth.token());

routerAuth.get(
  '/login',
  oauth.authenticate(),
  (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1] as string;
    res.status(200).json(Jwt.verify(token, process.env.TOKEN_SECRET as string));
  }
);

export default routerAuth;
