import express from 'express';
import UserController from '../controllers/UsersController';
import authenticateHandler from '../middleware/authentication';
import checkDbConfig from '../middleware/databaseConfig';
import saveAvatar from '../middleware/saveAvatar';

const usersController = new UserController();

const routerUsers = express.Router();

routerUsers.use(express.json());

routerUsers.use(checkDbConfig);

routerUsers.get('/', authenticateHandler, usersController.getAll);

routerUsers.get('/:id', authenticateHandler, usersController.get);

routerUsers.post('/', [authenticateHandler], usersController.add);

routerUsers.put(
  '/upload/:id',
  [authenticateHandler, saveAvatar],
  usersController.update
);

routerUsers.put(
  '/:id',
  [authenticateHandler, saveAvatar],
  usersController.update
);

routerUsers.delete('/:id', authenticateHandler, usersController.delete);

export default routerUsers;
