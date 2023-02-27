class CommentEntity {
  id: number;

  postId: number;

  parentId: number;

  text: string;

  author: number;

  authorName?: string;

  replyCount?: string;

  dateCreated?: Date;

  dateModified?: Date;

  authorAvatarPath?: string;

  constructor(
    id: number,
    postId: number,
    parentId: number,
    text: string,
    author: number
  ) {
    this.id = id;
    this.postId = postId;
    this.parentId = parentId;
    this.text = text;
    this.author = author;
    this.dateCreated = new Date();
    this.dateModified = new Date();
  }
}
export default CommentEntity;
