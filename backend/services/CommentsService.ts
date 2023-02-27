/* eslint-disable no-restricted-globals */
import CommentEntity from '../models/dto/CommentEntity';
import { comments, posts } from '../seeds/inmemDB';
import ICommentsService from './interfaces/ICommentsService';
import NotFoundError from '../error/NotFoundError';
import BadRequestError from '../error/BadRequesError';
import CommentPagination from './interfaces/CommentPagination';

export default class CommentsService implements ICommentsService {
  comments: CommentEntity[];

  constructor() {
    this.comments = comments;
  }

  getAll = async (
    name: string,
    startIndex: number,
    limit: number,
    postId: number,
    parentId: number
  ): Promise<CommentPagination> => {
    if (postId !== 0) {
      if (isNaN(postId)) {
        throw new BadRequestError(
          `No valid post with the postId ${postId} was found`
        );
      }

      let commentsList;

      if (parentId !== undefined) {
        commentsList = this.comments
          .filter((c) => c.postId === postId && c.parentId === parentId)
          .filter((c) => c.text.includes(name));
      } else {
        commentsList = this.comments
          .filter((c) => c.postId === postId)
          .filter((c) => c.text.toLowerCase().includes(name));
      }

      return {
        hasNext: startIndex + limit < commentsList.length,
        hasPrevious: startIndex - limit >= 0,
        result: commentsList.slice(startIndex, startIndex + limit),
      } as CommentPagination;
    }

    if (parentId !== undefined) {
      if (isNaN(parentId)) {
        throw new BadRequestError(
          'The comment with the given parentId was not found.'
        );
      }
      const commentsList = this.comments.filter((c) => c.parentId === parentId);

      return {
        hasNext: startIndex + limit < commentsList.length,
        hasPrevious: startIndex - limit >= 0,
        result: commentsList.slice(startIndex, startIndex + limit),
      } as CommentPagination;
    }

    return {
      hasNext: startIndex + limit < this.comments.length,
      hasPrevious: startIndex - limit >= 0,
      result: this.comments.slice(startIndex, startIndex + limit),
    } as CommentPagination;
  };

  get = async (id: number): Promise<CommentEntity> =>
    this.comments.find((c) => c.id === id) as CommentEntity;

  add = async (newComment: CommentEntity): Promise<CommentEntity> => {
    const post = posts.find((p) => p.id === newComment.postId);

    if (!post) {
      throw new NotFoundError(
        `No valid post with id number ${newComment.postId} was found`
      );
    }

    if (newComment.parentId === 0) {
      newComment.id = this.getNewId();
      newComment.dateCreated = new Date();
      newComment.dateModified = new Date();

      this.comments.push(newComment);
      return newComment;
    }

    const comment = comments.find((c) => c.id === newComment.parentId);

    if (!comment) {
      throw new NotFoundError(
        `No valid parentId ${newComment.parentId} was found`
      );
    }

    if (comment.postId === newComment.postId) {
      newComment.id = this.getNewId();
      newComment.dateCreated = new Date();
      newComment.dateModified = new Date();

      this.comments.push(newComment);
      return newComment;
    }

    throw new NotFoundError(
      `Parent comment must have same post id as new comment`
    );
  };

  update = async (
    id: number,
    updatedComment: CommentEntity
  ): Promise<CommentEntity> => {
    const index = this.comments.indexOf(await this.get(id));

    if (index === -1) {
      throw new NotFoundError('No comment was found');
    }

    const oldComment = this.comments[index];

    oldComment.text = updatedComment.text
      ? updatedComment.text
      : oldComment.text;

    updatedComment.dateModified = new Date();

    return this.comments[index];
  };

  delete = async (id: number): Promise<void> => {
    const commentToBeDeleted = await this.get(id);

    if (!commentToBeDeleted) {
      throw new NotFoundError('The comment with the given ID was not found');
    }

    const commentsToBeDeleted = this.comments.filter(
      (comment) => comment.parentId === id
    );

    this.DeleteAllCommentsReplies(commentsToBeDeleted);
    this.RemoveCommentsWithParentId(commentToBeDeleted);

    const index = this.comments.indexOf(commentToBeDeleted);
    this.comments.splice(index, 1);
  };

  private getNewId = (): number => {
    if (this.comments.length === 0) {
      return 1;
    }

    return this.comments[comments.length - 1].id + 1;
  };

  private RemoveCommentsWithParentId(commentToBeDeleted: CommentEntity) {
    for (let i = 0; i < this.comments.length; i++) {
      if (this.comments[i].parentId === commentToBeDeleted.id) {
        this.comments.splice(i--, 1);
      }
    }
  }

  private DeleteAllCommentsReplies(commentsToBeDeleted: CommentEntity[]) {
    if (commentsToBeDeleted.length === 0) {
      return;
    }

    for (let i = 0; i < commentsToBeDeleted.length; i += 1) {
      const local = this.comments.filter(
        (comment) => comment.parentId === commentsToBeDeleted[i].id
      );

      this.DeleteAllCommentsReplies(local);
      this.RemoveCommentsWithParentId(commentsToBeDeleted[i]);
    }
  }
}
