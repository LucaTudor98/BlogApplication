import Post from '../../models/dto/Post';

export default interface PostPagination {
  hasNext: boolean;
  hasPrevious: boolean;
  result: Post[];
}
