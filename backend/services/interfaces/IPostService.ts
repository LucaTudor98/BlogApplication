import Post from '../../models/dto/Post';
import PostPagination from './PostPagination';

export default interface IPostService {
  getAll(
    search: string,
    startIndex: number,
    limit: number
  ): Promise<PostPagination>;

  get(id: number): Promise<Post>;

  add(post: Post): Promise<Post>;

  update(postId: number, updatedPost: Post): Promise<Post>;

  delete(postId: number): Promise<void>;
}
