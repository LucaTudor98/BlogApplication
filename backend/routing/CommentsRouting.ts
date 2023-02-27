import express from 'express';
import CommentsController from '../controllers/CommentsController';
import authenticateHandler from '../middleware/authentication';
import checkDbConfig from '../middleware/databaseConfig';

const commentsController = new CommentsController();

const routerComments = express.Router();

routerComments.use(express.json());

routerComments.use(checkDbConfig);

routerComments.get('/', commentsController.getAll);

routerComments.get('/:id', commentsController.get);

routerComments.post('/', authenticateHandler, commentsController.add);

routerComments.put('/:id', authenticateHandler, commentsController.update);

routerComments.delete('/:id', authenticateHandler, commentsController.delete);

export default routerComments;
