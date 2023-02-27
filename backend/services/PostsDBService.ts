/* eslint-disable class-methods-use-this */
import { getRepository } from 'typeorm';
import PostDB from '../models/database/PostDB';
import Post from '../models/dto/Post';
import ImageService from './ImageService';
import IImageService from './interfaces/IImageService';
import IPostService from './interfaces/IPostService';
import PostPagination from './interfaces/PostPagination';

export default class PostsDBService implements IPostService {
  imageService: IImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  async get(id: number): Promise<Post> {
    const dbPost = await getRepository(PostDB)
      .createQueryBuilder('post')
      .where('post.id = :id', { id })
      .innerJoin('post.user', 'user')
      .leftJoin('post.comments', 'comments')
      .select([
        'post.id as id',
        'post.title as title',
        'post.content as content',
        'post.dateCreated as dateCreated',
        'post.dateModified as dateModified',
        'post.image as imagePath',
        'user.id as author',
        'user.name as authorName',
        'COUNT(comments.id) as numberOfComments',
      ])
      .getRawOne();
    return this.createDtoPost(dbPost);
  }

  async getAll(
    search: string,
    startIndex: number,
    limit: number
  ): Promise<PostPagination> {
    const posts = [] as Post[];
    const resForm = [
      'post.id as id',
      'post.title as title',
      'post.dateCreated as dateCreated',
      'post.dateModified as dateModified',
      'post.image as imagePath',
      'SUBSTR(post.content, 1, 200) as content',
      'user.id as author',
      'user.name as authorName',
      'COUNT(comments.id) as numberOfComments',
    ];

    const query = getRepository(PostDB)
      .createQueryBuilder('post')
      .innerJoin('post.user', 'user')
      .leftJoin('post.comments', 'comments')
      .where('LOWER(post.title) like :search', { search: `%${search}%` })
      .orWhere('LOWER(post.content) like :search', { search: `%${search}%` })
      .orWhere('LOWER(user.name) like :search', { search: `%${search}%` })
      .groupBy('post.id')
      .select(resForm)
      .orderBy('post.dateCreated', 'DESC');

    const [list, count] = await Promise.all([
      query.offset(startIndex).limit(limit).getRawMany(),
      query.getCount(),
    ]);

    for (let i = 0; i < list.length; i++) {
      posts.push(this.createDtoPost(list[i]));
    }

    const result: PostPagination = {
      hasNext: startIndex + limit < count,
      hasPrevious: startIndex - limit >= 0,
      result: posts,
    };

    return result;
  }

  async add(post: Post): Promise<Post> {
    const addedPost = await getRepository(PostDB)
      .save(post)
      .then((data) => data);

    return this.createDtoPost(addedPost);
  }

  async update(postId: number, updatedPost: Post): Promise<Post> {
    const postToUpdate = await this.get(postId);
    postToUpdate.title = updatedPost.title;
    postToUpdate.content = updatedPost.content;
    postToUpdate.dateModified = updatedPost.dateModified;
    postToUpdate.dateCreated = updatedPost.dateCreated;

    this.imageService.update(postToUpdate.image, updatedPost.image);

    if (updatedPost.image) {
      postToUpdate.image = updatedPost.image;
    }

    await getRepository(PostDB).save(postToUpdate);

    return this.createDtoPost(postToUpdate);
  }

  async delete(postId: number): Promise<void> {
    const post = await this.get(postId);
    if (post.image) {
      this.imageService.delete(post.image);
    }

    await getRepository(PostDB)
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: postId })
      .execute();
  }

  private createDtoPost(dbPost: PostDB | any): Post {
    if (typeof dbPost.id === 'undefined') {
      throw new Error('Could not find post in database');
    }

    const post: Post = {
      id: dbPost.id as number,
      title: dbPost.title,
      content: dbPost.content,
      author: dbPost.author,
      image: dbPost?.imagePath,
      dateCreated: dbPost.dateCreated,
      dateModified: dbPost.dateModified,
      authorName: dbPost.authorName,
      numberOfComments: dbPost?.numberOfComments,
    };
    return post;
  }
}
