/* eslint-disable class-methods-use-this */
import NotFoundError from '../error/NotFoundError';
import Post from '../models/dto/Post';
import { posts, users, comments } from '../seeds/inmemDB';
import IPostService from './interfaces/IPostService';
import PostPagination from './interfaces/PostPagination';

export default class PostsService implements IPostService {
  postList: Post[] = [];

  constructor() {
    this.postList = posts;
  }

  async get(postId: number): Promise<Post> {
    const post = this.postList.find((p) => p.id === postId) as Post;

    if (!post) {
      throw new NotFoundError(`No post with id number ${postId} was found`);
    }

    return post;
  }

  async getAll(
    search: string,
    startIndex: number,
    limit: number
  ): Promise<PostPagination> {
    const filteredPosts = this.postList.filter(
      (post) =>
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        users
          .find((user) => user.id === post.author)
          ?.name.toLowerCase()
          .includes(search)
    );

    const result: PostPagination = {
      hasNext: startIndex + limit < posts.length,
      hasPrevious: startIndex - limit >= 0,
      result: filteredPosts.slice(startIndex, startIndex + limit),
    };

    return result;
  }

  async add(post: Post): Promise<Post> {
    const findUser = users.find((u) => u.id === post.author);

    if (!findUser) {
      throw new NotFoundError(
        `No user with id number ${post.author} was found`
      );
    }

    const newId = this.getNewId();
    const newPost: Post = new Post(
      newId,
      post.title,
      post.content,
      post.author,
      new Date(),
      new Date(),
      post.image
    );

    this.postList.push(newPost);
    return newPost;
  }

  async update(postId: number, post: Post): Promise<Post> {
    const oldPost: Post = await this.get(postId);

    if (!oldPost) {
      throw new NotFoundError(`No post with id number ${postId} was found`);
    }

    const index = this.postList.indexOf(oldPost);
    const postUpdated = new Post(
      postId,
      post.title,
      post.content,
      oldPost.author,
      oldPost.dateCreated as Date,
      new Date(),
      post.image
    );

    this.postList[index] = postUpdated;
    return postUpdated;
  }

  async delete(postId: number): Promise<void> {
    const post = await this.get(postId);

    if (!post) {
      throw new NotFoundError(`No post with id number ${postId} was found`);
    }

    PostsService.deleteCommentsFromPost(postId);
    const index = this.postList.indexOf(post);
    this.postList.splice(index, 1);
  }

  getNewId() {
    if (this.postList.length === 0) {
      return 1;
    }

    return (this.postList[this.postList.length - 1].id as number) + 1;
  }

  private static deleteCommentsFromPost(id: number) {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].postId === id) {
        comments.splice(i--, 1);
      }
    }
  }
}
