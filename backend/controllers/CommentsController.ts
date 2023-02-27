/* eslint-disable no-restricted-globals */
import { Request, Response } from 'express';
import CommentEntity from '../models/dto/CommentEntity';
import ICommentsService from '../services/interfaces/ICommentsService';
import Services from '../services/services';
import CustomError from '../error/CustomError';

export default class CommentsController {
  commentsService: ICommentsService;

  constructor(
    commentsService: ICommentsService = Services.getCommentsService()
  ) {
    this.commentsService = commentsService;
  }

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const { query } = req;
    const defaultPageLimit = 5;

    let { name } = query;

    if (!name) {
      name = '';
    }

    let comments;
    let postId = 0;
    let parentId: number | null | undefined;

    const page = query.page ? parseInt(query.page as string, 10) : 1;
    const limit = query.limit
      ? parseInt(query.limit as string, 10)
      : defaultPageLimit;

    if (query.postId) {
      postId = parseInt(query.postId as string, 10);
    }

    if (query.parentId) {
      if (query.parentId === '\x00') {
        parentId = null;
      } else {
        parentId = parseInt(query.parentId as string, 10);
      }
    }

    const startIndex = (page - 1) * limit;

    try {
      comments = await this.commentsService.getAll(
        (name as string).toLowerCase(),
        startIndex,
        limit,
        postId,
        parentId
      );
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.errorMessageJson());
      }
    }

    return res.status(200).json(comments);
  };

  get = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: `Id is not a number` });
    }

    const comment = await this.commentsService.get(id);

    if (!comment) {
      return res.status(404).json({
        error: 'The comment with the given ID was not found',
      });
    }

    return res.status(200).json(comment);
  };

  add = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.postId || !req.body.text) {
      return res.status(400).json({ message: 'Some data is missing' });
    }

    if (!req.userId) {
      return res.status(400).json({ message: 'Author is not valid' });
    }

    let response;
    const commentToAdd: CommentEntity = {
      id: req.body.id,
      parentId: req.body.parentId,
      postId: req.body.postId,
      text: req.body.text,
      author: req.userId as number,
    };

    try {
      response = await this.commentsService.add(commentToAdd);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.errorMessageJson());
      }
    }

    if (response) {
      return res.status(200).json(response);
    }

    return res
      .status(400)
      .json({ message: 'Post or Comment for reply does not exist' });
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    let comment;
    const id = parseInt(req.params.id, 10);
    const updatedComment: CommentEntity = {
      id,
      postId: 0,
      parentId: 0,
      text: req.body.text,
      author: 0,
    };

    const dbComment = await this.commentsService.get(id);

    if (!dbComment) {
      return res.status(404).json({ message: 'Comment does not exist' });
    }

    if (
      !CommentsController.isAuthorizedForRes(
        req.isAdmin,
        req.userId,
        dbComment.author
      )
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
      comment = await this.commentsService.update(id, updatedComment);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.errorMessageJson());
      }
    }

    return res.status(200).json(comment);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id, 10);
    const comment = await this.commentsService.get(id);

    if (!comment) {
      return res.status(404).json();
    }

    if (
      CommentsController.isAuthorizedForRes(
        req.isAdmin,
        req.userId,
        comment.author
      )
    ) {
      try {
        await this.commentsService.delete(id);
      } catch (error) {
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.errorMessageJson());
        }
      }

      return res.status(200).json();
    }

    return res.status(403).json({ error: 'Unauthorized' });
  };

  private static isAuthorizedForRes(
    isAdmin: boolean | undefined,
    userId: number | undefined,
    userParamId: number | undefined
  ): boolean {
    return isAdmin || userId === userParamId;
  }
}
