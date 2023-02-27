/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-globals */
import { Request, Response } from 'express';
import Services from '../services/services';
import Post from '../models/dto/Post';
import IPostService from '../services/interfaces/IPostService';
import CustomError from '../error/CustomError';
import PostDB from '../models/database/PostDB';

export default class PostsController {
  postsService: IPostService;

  constructor(postsService: IPostService = Services.getPostService()) {
    this.postsService = postsService;
  }

  getAll = async (req: Request, res: Response) => {
    const { query } = req;

    if (!query.search) {
      query.search = '';
    }

    const defaultFirstPage = 1;
    const defaultQueryLimit = 5;

    const page = query.page
      ? parseInt(query.page as string, 10)
      : defaultFirstPage;
    const limit = query.limit
      ? parseInt(query.limit as string, 10)
      : defaultQueryLimit;

    const startIndex = (page - 1) * limit;

    return res
      .status(200)
      .json(
        await this.postsService.getAll(
          (query.search as string).toLocaleLowerCase(),
          startIndex,
          limit
        )
      );
  };

  get = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: `Id is not a number` });
    }

    let post;
    try {
      post = await this.postsService.get(id);
    } catch (error) {
      return res
        .status(404)
        .json({ error: `No post with id number ${id} was found` });
    }

    return res.status(200).json(post);
  };

  add = async (req: Request, res: Response) => {
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ error: 'Some data is missing' });
    }

    if (req.userId === undefined) {
      return res.status(401).json();
    }

    let newPost;
    const post = new Post(
      req.body.id,
      req.body.title,
      req.body.content,
      req.userId as number,
      new Date(),
      new Date(),
      req.body.fileName
    );

    try {
      newPost = await this.postsService.add(post);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.errorMessageJson());
      }
    }

    return res.status(200).json(newPost);
  };

  update = async (req: Request, res: Response) => {
    if (!req.body.title && !req.body.content) {
      return res.status(400).json({ error: 'No data to modify!' });
    }

    const id = parseInt(req.params.id, 10);
    let postToBeUpdated;
    try {
      postToBeUpdated = await this.postsService.get(id);
    } catch (error) {
      return res
        .status(404)
        .json({ error: `No post with id number ${id} was found` });
    }

    const postUpdated: Post = {
      id,
      title: req.body.title,
      content: req.body.content,
      author: req.userId as number,
      image: req.body.fileName,
      dateCreated: postToBeUpdated.dateCreated,
      dateModified: new Date(),
    };

    if (this.isAdminOrOwner(req.isAdmin, req.userId, postToBeUpdated.author)) {
      try {
        postToBeUpdated = await this.postsService.update(id, postUpdated);
      } catch (error) {
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.errorMessageJson());
        }
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.status(200).json(postToBeUpdated);
  };

  delete = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    let postToBeDeleted;

    try {
      postToBeDeleted = await this.postsService.get(id);
    } catch (error) {
      return res
        .status(404)
        .json({ error: `No post with id number ${id} was found` });
    }

    if (this.isAdminOrOwner(req.isAdmin, req.userId, postToBeDeleted.author)) {
      try {
        await this.postsService.delete(id);
      } catch (error) {
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.errorMessageJson());
        }
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ message: 'Post deleted successfully' });
  };

  isAdminOrOwner = (
    isAdmin: boolean | undefined,
    userId: number | undefined,
    author: number
  ) => {
    if (isAdmin || userId === author) {
      return true;
    }

    return false;
  };
}
