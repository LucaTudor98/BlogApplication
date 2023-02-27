/* eslint-disable class-methods-use-this */
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import UserDB from '../models/database/userDb';
import User from '../models/dto/User';
import IUserService from './interfaces/IUserService';
import UserPagination from './interfaces/UserPagination';
import IImageService from './interfaces/IImageService';
import ImageService from './ImageService';

export default class UserDBService implements IUserService {
  imageService: IImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  async get(id: number): Promise<User> {
    const user = await getRepository(UserDB)
      .findOne(id)
      .then((data) => data);

    return this.createUserDto(user);
  }

  async getAll(
    name: string,
    startIndex: number,
    limit: number
  ): Promise<UserPagination> {
    const resForm = [
      'user.id as id',
      'user.name as name',
      'user.email as email',
      '"" as password',
      'user.isAdmin as isAdmin',
      'user.dateCreated as dateCreated',
      'user.dateModified as dateModified',
      'user.imgPath as imgPath',
    ];

    const query = getRepository(UserDB)
      .createQueryBuilder('user')
      .where('user.name like :name', { name: `%${name}%` })
      .orWhere('user.email like :name', { name: `%${name}%` });

    const [list, count] = await Promise.all([
      query.select(resForm).skip(startIndex).take(limit).getRawMany(),
      query.getCount(),
    ]);

    const results: UserPagination = {
      hasNext: startIndex + limit < count,
      hasPrevious: startIndex - limit >= 0,
      result: list,
    };

    return results;
  }

  async add(user: UserDB): Promise<User> {
    user.dateCreated = new Date();
    user.dateModified = new Date();

    user.password = await bcrypt.hash(user.password, 10);

    const newUser = await getRepository(UserDB)
      .save(user)
      .then((data) => data);

    return this.createUserDto(newUser);
  }

  async update(userId: number, updatedUser: UserDB): Promise<User> {
    const userToUpdate = await getRepository(UserDB)
      .createQueryBuilder()
      .where('id= :id', { id: userId })
      .getOneOrFail();

    if (updatedUser.imgPath) {
      this.imageService.update(userToUpdate.imgPath, updatedUser.imgPath);
    }

    userToUpdate.name = updatedUser.name ? updatedUser.name : userToUpdate.name;

    userToUpdate.email = updatedUser.email
      ? updatedUser.email
      : userToUpdate.email;
    userToUpdate.password = updatedUser.password
      ? await bcrypt.hash(updatedUser.password, 10)
      : userToUpdate.password;

    userToUpdate.dateModified = new Date();
    userToUpdate.isAdmin =
      updatedUser.isAdmin === undefined
        ? userToUpdate.isAdmin
        : updatedUser.isAdmin;
    userToUpdate.imgPath =
      updatedUser.imgPath !== '' ? updatedUser.imgPath : userToUpdate.imgPath;

    await getRepository(UserDB).save(userToUpdate);

    return this.createUserDto(userToUpdate);
  }

  async delete(userId: number): Promise<void> {
    const user = await this.get(userId);
    this.imageService.delete(user.imgPath);

    await getRepository(UserDB)
      .createQueryBuilder()
      .delete()
      .where('id= :id', { id: userId })
      .execute();
  }

  private createUserDto(dbUser: UserDB | any): User {
    if (typeof dbUser.id === 'undefined') {
      throw new Error('Could not find user in database');
    }

    const user: User = {
      id: dbUser?.id as number,
      name: dbUser?.name as string,
      email: dbUser?.email as string,
      password: '',
      isAdmin: dbUser?.isAdmin as boolean,
      dateCreated: dbUser.dateCreated,
      dateModified: dbUser.dateModified,
      imgPath: dbUser.imgPath,
    };

    return user;
  }
}
