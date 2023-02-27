import CommentEntity from '../../models/dto/CommentEntity';
import CommentPagination from './CommentPagination';

export default interface ICommentsService {
  getAll(
    name: string,
    startIndex: number,
    limit: number,
    postId?: number,
    parentId?: number | null
  ): Promise<CommentPagination>;

  get(id: number): Promise<CommentEntity>;

  add(newComment: CommentEntity): Promise<CommentEntity>;

  update(id: number, updatedComment: CommentEntity): Promise<CommentEntity>;

  delete(id: number): Promise<void>;
}
