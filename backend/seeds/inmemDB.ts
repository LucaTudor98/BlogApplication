import Post from '../models/dto/Post';
import User from '../models/dto/User';
import CommentEntity from '../models/dto/CommentEntity';

export const users: User[] = [
  new User(1, 'first', 'first@gmail.com', 'firstPassword', false),
  new User(2, 'second', 'second@gmail.com', 'secondPassword', false),
];

export const posts: Post[] = [
  new Post(1, 'First post', 'My first post', 2, new Date(), new Date()),
  new Post(2, 'Second post', 'My second post', 2, new Date(), new Date()),
];

export const comments: CommentEntity[] = [
  new CommentEntity(1, 1, 0, 'Super post!', 1),
  new CommentEntity(2, 2, 0, 'Great !!!', 2),
];
