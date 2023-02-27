/* eslint-disable no-restricted-globals */
import { Request, Response } from 'express';
import Services from '../services/services';
import IUserService from '../services/interfaces/IUserService';
import User from '../models/dto/User';

export default class UserController {
  userService: IUserService;

  constructor(userService: IUserService = Services.getUsersService()) {
    this.userService = userService;
  }

  getAll = async (req: Request, res: Response) => {
    const { query } = req;

    let { name } = query;

    if (!name) {
      name = '';
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

    if (req.isAdmin) {
      return res
        .status(200)
        .json(
          await this.userService.getAll(
            (name as string).toLocaleLowerCase(),
            startIndex,
            limit
          )
        );
    }

    return res.status(403).json({ error: 'Unauthorized' });
  };

  get = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    let user;

    if (isNaN(id)) {
      return res.status(400).json({ message: `Id is not a number` });
    }
    try {
      user = await this.userService.get(id);
    } catch (err) {
      return res.status(404).json({ message: 'The user was not found' });
    }

    if (UserController.isAuthorizedForRes(req.isAdmin, req.userId, user.id)) {
      return res.status(200).json(user);
    }

    return res.status(403).json({ error: 'Unauthorized' });
  };

  add = async (req: Request, res: Response) => {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      req.body.isAdmin === undefined
    ) {
      return res.status(400).json({ message: 'Some data is missing' });
    }

    const user = new User(
      req.body.id,
      req.body.name,
      req.body.email,
      req.body.password,
      req.isAdmin ? req.body.isAdmin : false,
      req.file?.filename ? req.file?.filename : ''
    );
    return res.status(200).json(await this.userService.add(user));
  };

  update = async (req: Request, res: Response) => {
    if (!req.params || !req.params.id) {
      return res.status(400).json({ message: 'User id is missing' });
    }

    let user: User;

    try {
      if (
        UserController.isAuthorizedForRes(
          req.isAdmin,
          req.userId,
          parseInt(req.params.id, 10)
        )
      ) {
        user = await this.userService.update(
          parseInt(req.params.id, 10),
          new User(
            parseInt(req.params.id, 10),
            req.body.name,
            req.body.email,
            req.body.password === undefined || req.body.password === ''
              ? undefined
              : req.body.password,
            req.isAdmin ? req.body.isAdmin : false,
            req.file?.filename ? req.file?.filename : ''
          )
        );
      } else {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      return res.status(404).json({ message: 'User id is invalid' });
    }

    return res.status(200).json(user);
  };

  delete = async (req: Request, res: Response) => {
    if (!req.params || !req.params.id) {
      return res.status(400).json({ message: 'User id is missing' });
    }

    let user;

    try {
      if (
        UserController.isAuthorizedForRes(
          req.isAdmin,
          req.userId,
          parseInt(req.params.id, 10)
        )
      ) {
        user = await this.userService.get(parseInt(req.params.id, 10));

        await this.userService.delete(user.id);
      } else {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      return res.status(404).json({ message: 'The user was not found' });
    }

    return res.status(200).json(user);
  };

  private static isAuthorizedForRes(
    isAdmin: boolean | undefined,
    userId: number | undefined,
    userParamId: number
  ): boolean {
    return isAdmin || userId === userParamId;
  }
}
