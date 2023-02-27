import User from '../../models/dto/User';
import UserPagination from './UserPagination';

export default interface IUserService {
  getAll(
    name: string,
    startIndex: number,
    limit: number
  ): Promise<UserPagination>;

  get(id: number): Promise<User>;

  add(user: User): Promise<User>;

  update(id: number, user: User): Promise<User>;

  delete(id: number): Promise<void>;
}
