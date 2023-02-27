/* eslint-disable class-methods-use-this */
import { Brackets, getRepository } from 'typeorm';
import NotFoundError from '../error/NotFoundError';
import CommentEntityDB from '../models/database/CommentDB';
import CommentEntity from '../models/dto/CommentEntity';
import CommentPagination from './interfaces/CommentPagination';
import ICommentsService from './interfaces/ICommentsService';

export default class CommentsDBService implements ICommentsService {
  async getAll(
    name: string,
    startIndex: number,
    limit: number,
    postId = 0,
    parentId = 0
  ): Promise<CommentPagination> {
    let query;
    const resForm = [
      'comment.id as id',
      'comment.postId as postId',
      'comment.parentId as parentId',
      'comment.text as text',
      'comment.author as author',
      'comment.dateCreated as dateCreated',
      'comment.dateModified as dateModified',
      'user.name as authorName',
      'user.imgPath as authorAvatarPath',
    ];

    if (postId !== 0 && parentId === null) {
      query = getRepository(CommentEntityDB)
        .createQueryBuilder('comment')
        .where('comment.postId = :postId', { postId })
        .andWhere('comment.parentId is null')
        .orderBy('comment.dateCreated', 'DESC')
        .innerJoin('comment.user', 'user')
        .leftJoin('comment.children', 'reply')
        .groupBy('comment.id')
        .select([...resForm, 'COUNT(reply.id) as replyCount']);

      const [list, count] = await Promise.all([
        query.offset(startIndex).limit(limit).getRawMany(),
        query.getCount(),
      ]);

      return {
        hasNext: startIndex + limit < count,
        hasPrevious: startIndex - limit >= 0,
        result: list,
      } as CommentPagination;
    }

    if (postId !== 0 && parentId !== 0) {
      query = getRepository(CommentEntityDB)
        .createQueryBuilder('comment')
        .where('comment.postId = :postId', { postId })
        .andWhere('comment.parentId = :parentId', { parentId })
        .orderBy('comment.dateCreated', 'DESC')
        .innerJoin('comment.user', 'user')
        .select(resForm);

      const [list, count] = await Promise.all([
        query.offset(startIndex).limit(limit).getRawMany(),
        query.getCount(),
      ]);

      return {
        hasNext: startIndex + limit < count,
        hasPrevious: startIndex - limit >= 0,
        result: list,
      } as CommentPagination;
    }

    if (postId !== 0) {
      query = getRepository(CommentEntityDB)
        .createQueryBuilder('comment')
        .where('comment.postId = :postId', { postId })
        .orderBy('comment.dateCreated', 'DESC')
        .innerJoin('comment.user', 'user')
        .andWhere(
          new Brackets((qb) => {
            qb.where('comment.text like :name', {
              name: `%${name}%`,
            }).orWhere('user.name like :name', { name: `%${name}%` });
          })
        )
        .select(resForm);

      const [list, count] = await Promise.all([
        query.offset(startIndex).limit(limit).getRawMany(),
        query.getCount(),
      ]);

      return {
        hasNext: startIndex + limit < count,
        hasPrevious: startIndex - limit >= 0,
        result: list,
      } as CommentPagination;
    }

    if (parentId !== 0) {
      query = getRepository(CommentEntityDB)
        .createQueryBuilder('comment')
        .where('comment.parentId = :parentId', { parentId })
        .orderBy('comment.dateCreated', 'DESC')
        .innerJoin('comment.user', 'user')
        .select(resForm);

      const [list, count] = await Promise.all([
        query.offset(startIndex).limit(limit).getRawMany(),
        query.getCount(),
      ]);

      return {
        hasNext: startIndex + limit < count,
        hasPrevious: startIndex - limit >= 0,
        result: list,
      } as CommentPagination;
    }

    const list = (await getRepository(CommentEntityDB)
      .find()
      .then((data) => data)) as CommentEntity[];

    return {
      hasNext: false,
      hasPrevious: false,
      result: list,
    } as CommentPagination;
  }

  async get(id: number): Promise<CommentEntityDB> {
    return (await getRepository(CommentEntityDB).findOne(
      id
    )) as CommentEntityDB;
  }

  async delete(id: number): Promise<void> {
    Promise.resolve(getRepository(CommentEntityDB).delete(id));
  }

  async update(
    commentId: number,
    comment: CommentEntityDB
  ): Promise<CommentEntityDB> {
    const oldComment: CommentEntityDB = await this.get(commentId);

    if (!oldComment) {
      throw new NotFoundError('The comment with the given ID was not found');
    }

    const newComment: CommentEntityDB = {
      id: oldComment.id,
      postId: oldComment.postId,
      parentId: oldComment.parentId,
      text: comment.text,
      author: oldComment.author,
      dateCreated: oldComment.dateCreated,
      dateModified: new Date(),
    };

    Promise.resolve(getRepository(CommentEntityDB).save(newComment));

    return newComment;
  }

  async add(comment: CommentEntityDB): Promise<CommentEntityDB> {
    const newComment = new CommentEntityDB(
      comment.id,
      comment.postId,
      comment.parentId,
      comment.text,
      comment.author
    );

    if (comment.parentId) {
      const parentComment = await this.get(comment.parentId);

      if (parentComment.postId !== newComment.postId) {
        throw new Error(
          'Parent post id must be the same as new comment post id'
        );
      }
    }

    return Promise.resolve(getRepository(CommentEntityDB).save(newComment));
  }
}
