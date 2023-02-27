import express from 'express';
import PostsController from '../controllers/PostsController';
import authenticateHandler from '../middleware/authentication';
import checkDbConfig from '../middleware/databaseConfig';

const postsController: PostsController = new PostsController();

const routePosts = express.Router();

routePosts.use(express.json());

routePosts.use(checkDbConfig);

routePosts.get('/', postsController.getAll);

routePosts.get('/:id', postsController.get);

routePosts.post('/', authenticateHandler, postsController.add);

routePosts.put('/:id', authenticateHandler, postsController.update);

routePosts.delete('/:id', authenticateHandler, postsController.delete);

export default routePosts;
