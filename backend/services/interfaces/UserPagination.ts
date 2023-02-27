import User from '../../models/dto/User';

export default interface UserPagination {
  hasNext: boolean;
  hasPrevious: boolean;
  result: User[];
}
