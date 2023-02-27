import PostsService from './PostsService';
import PostsDBService from './PostsDBService';
import CommentsService from './CommentsService';
import CommentsDBService from './CommentsDBService';
import UserService from './UsersService';
import UserDBService from './UsersDBService';
import IPostService from './interfaces/IPostService';
import IUserService from './interfaces/IUserService';
import ICommentsService from './interfaces/ICommentsService';
import DB from '../database/DBConnection';
import MockDB from './mockDbservice';
import IDbService from './interfaces/IDbService';

class Services {
  static postInMemory = new PostsService();

  static userInMemory = new UserService();

  static commentsInMemory = new CommentsService();

  static userDb = new UserDBService();

  static postsDb = new PostsDBService();

  static commentsDb = new CommentsDBService();

  static db = new DB();

  static mockDbInmemory = new MockDB();

  static getPostService(): IPostService {
    if (process.env.NODE_ENV !== 'test') {
      return this.postsDb;
    }
    return this.postInMemory;
  }

  static getCommentsService(): ICommentsService {
    if (process.env.NODE_ENV !== 'test') {
      return this.commentsDb;
    }
    return this.commentsInMemory;
  }

  static getUsersService(): IUserService {
    if (process.env.NODE_ENV !== 'test') {
      return this.userDb;
    }

    return this.userInMemory;
  }

  static getDBService(): IDbService {
    if (process.env.NODE_ENV !== 'test') {
      return this.db;
    }
    return this.mockDbInmemory;
  }
}

export default Services;
