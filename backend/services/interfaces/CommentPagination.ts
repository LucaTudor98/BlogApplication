import CommentEntity from '../../models/dto/CommentEntity';

export default interface CommentPagination {
  hasNext: boolean;
  hasPrevious: boolean;
  result: CommentEntity[];
}
