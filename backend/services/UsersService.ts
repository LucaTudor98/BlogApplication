import User from '../models/dto/User';
import { users, posts, comments } from '../seeds/inmemDB';
import UserPagination from './interfaces/UserPagination';
import IUserService from './interfaces/IUserService';
import ImageService from './ImageService';
import IImageService from './interfaces/IImageService';

export default class UsersService implements IUserService {
  users: User[];

  imageService: IImageService;

  constructor(input: User[] = users) {
    this.users = input;
    this.imageService = new ImageService();
  }

  async get(id: number): Promise<User> {
    const user = this.users.find((x) => x.id === id) as User;

    if (!user) {
      throw new Error('Could not find User');
    }

    return user;
  }

  async getAll(
    name: string,
    startIndex: number,
    limit: number
  ): Promise<UserPagination> {
    const results: UserPagination = {
      hasNext: startIndex + limit < users.length,
      hasPrevious: startIndex - limit >= 0,
      result: this.users
        .filter(
          (user) =>
            user.name.toLowerCase().includes(name) ||
            user.email.toLowerCase().includes(name)
        )
        .slice(startIndex, startIndex + limit),
    };

    return results;
  }

  async add(user: User): Promise<User> {
    const newUser: User = {
      id: this.users.length > 0 ? this.users[this.users.length - 1].id + 1 : 1,
      name: user?.name,
      password: user?.password,
      email: user?.email,
      dateCreated: new Date(),
      dateModified: new Date(),
      isAdmin: user?.isAdmin,
    };

    this.users.push(newUser);

    return newUser;
  }

  async update(userId: number, user: User): Promise<User> {
    const userInDB: User = await this.get(userId);
    if (!userInDB) {
      throw new Error();
    }

    userInDB.name = user.name === undefined ? userInDB?.name : user.name;
    userInDB.email = user.email === undefined ? userInDB?.email : user.email;
    userInDB.dateModified = new Date();
    userInDB.password =
      user.password === undefined ? userInDB?.password : user.password;
    userInDB.isAdmin =
      user.isAdmin === undefined ? userInDB?.isAdmin : user.isAdmin;
    userInDB.imgPath = user.imgPath !== '' ? user.imgPath : userInDB.imgPath;

    return userInDB;
  }

  async delete(id: number): Promise<void> {
    const user = await this.get(id);
    if (!user) {
      throw new Error();
    }

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        this.users.splice(i, 1);
        break;
      }
    }

    UsersService.deleteUserPosts(id);
  }

  private static deleteUserPosts(author: number): void {
    for (let i = posts.length - 1; i >= 0; i--) {
      if (posts[i].author === author) {
        UsersService.deleteCommentsFromPost(posts[i].id);
        posts.splice(i, 1);
      }
    }
  }

  private static deleteCommentsFromPost(postId: number): void {
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].postId === postId) {
        comments.splice(i, 1);
      }
    }
  }
}
