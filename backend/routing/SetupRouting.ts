import express, { Request, Response } from 'express';
import Services from '../services/services';

const routerSetupDb = express.Router();
routerSetupDb.use(express.json());

routerSetupDb.get('/', (req: Request, res: Response) => {
  const db = Services.getDBService();
  if (db.isConfigured()) {
    return res.status(404).json({ error: 'Database is already configured!' });
  }

  if (!req.body.user && !req.body.password && !req.body.database) {
    return res.status(400).send('Database need configuration!');
  }

  if (!req.body.user || !req.body.password || !req.body.database) {
    return res.status(400).send('Some setup data are missing!');
  }

  const standardLocalhost: string =
    req.body.localhost == null ? 'localhost' : req.body.localhost;
  const standardPort: number =
    req.body.port == null ? 3306 : req.body.localhost;
  const setupData = {
    localhost: standardLocalhost,
    port: standardPort,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,
  };

  db.saveDB(
    standardLocalhost,
    standardPort,
    req.body.user,
    req.body.password,
    req.body.database
  );
  db.connect();
  return res.status(200).send(setupData);
});

export default routerSetupDb;
