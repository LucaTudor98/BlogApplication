import request from 'supertest';
import jwt, { Secret } from 'jsonwebtoken';
import app from '../../app';
import { comments, posts, users } from '../../seeds/inmemDB';
import Post from '../../models/dto/Post';
import User from '../../models/dto/User';
import CommentEntity from '../../models/dto/CommentEntity';
import MockDB from '../../services/mockDbservice';

const db = new MockDB();

let adminToken: string;
let simpleToken: string;

function initializeCommentsDatabase() {
  comments.push(new CommentEntity(1, 1, 0, 'Super post!', 1));
  comments.push(new CommentEntity(2, 2, 0, 'Great !!!', 2));
}

function initializeUsersDatabase() {
  users.push(new User(1, 'random1', 'random1@gmail.com', 'password1', false));
  users.push(new User(2, 'random2', 'random2@gmail.com', 'password2', false));
  users.push(new User(3, 'random3', 'random3@gmail.com', 'password3', true));
  db.setConfigValue(true);
}

function initializePostsDatabase() {
  posts.push(
    new Post(1, 'First post', 'My first post', 1, new Date(), new Date())
  );
  posts.push(
    new Post(2, 'Second post', 'My second post', 1, new Date(), new Date())
  );
}

function createAuthToken(user: User) {
  const token = jwt.sign(
    {
      user,
    },
    process.env.TOKEN_SECRET as Secret,
    { expiresIn: '1h' }
  );

  return token;
}

function clearAllDatabases() {
  comments.splice(0, comments.length);
  posts.splice(0, posts.length);
  users.splice(0, users.length);
}

beforeAll(() => {
  clearAllDatabases();
});

beforeEach(() => {
  initializeCommentsDatabase();
  initializePostsDatabase();
  initializeUsersDatabase();

  adminToken = createAuthToken(users[2]);
  simpleToken = createAuthToken(users[0]);
});

afterEach(() => {
  clearAllDatabases();
});

test('GET all comments', async () => {
  const res = await request(app).get('/api/comments');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].id).toEqual(1);
  expect(res.body.result[0].postId).toEqual(1);
  expect(res.body.result[0].parentId).toEqual(0);
  expect(res.body.result[0].text).toEqual('Super post!');
  expect(res.body.result[0].author).toEqual(1);
  expect(res.body.result[1].id).toEqual(2);
  expect(res.body.result[1].postId).toEqual(2);
  expect(res.body.result[1].parentId).toEqual(0);
  expect(res.body.result[1].text).toEqual('Great !!!');
  expect(res.body.result[1].author).toEqual(2);
});

test('GET all comments, page default, limit default', async () => {
  comments.push(new CommentEntity(3, 2, 0, 'Super post!1', 2));
  comments.push(new CommentEntity(4, 2, 0, 'Super post!2', 2));
  comments.push(new CommentEntity(5, 2, 0, 'Super post!3', 2));
  comments.push(new CommentEntity(6, 2, 0, 'Super post!4', 2));

  const res = await request(app).get('/api/comments');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].id).toEqual(1);
  expect(res.body.result[0].postId).toEqual(1);
  expect(res.body.result[0].parentId).toEqual(0);
  expect(res.body.result[0].text).toEqual('Super post!');
  expect(res.body.result[0].author).toEqual(1);
  expect(res.body.result[1].id).toEqual(2);
  expect(res.body.result[1].postId).toEqual(2);
  expect(res.body.result[1].parentId).toEqual(0);
  expect(res.body.result[1].text).toEqual('Great !!!');
  expect(res.body.result[1].author).toEqual(2);
  expect(res.body.result[2].id).toEqual(3);
  expect(res.body.result[2].postId).toEqual(2);
  expect(res.body.result[2].parentId).toEqual(0);
  expect(res.body.result[2].text).toEqual('Super post!1');
  expect(res.body.result[2].author).toEqual(2);
  expect(res.body.result[3].id).toEqual(4);
  expect(res.body.result[3].postId).toEqual(2);
  expect(res.body.result[3].parentId).toEqual(0);
  expect(res.body.result[3].text).toEqual('Super post!2');
  expect(res.body.result[3].author).toEqual(2);
  expect(res.body.result[4].id).toEqual(5);
  expect(res.body.result[4].postId).toEqual(2);
  expect(res.body.result[4].parentId).toEqual(0);
  expect(res.body.result[4].text).toEqual('Super post!3');
  expect(res.body.result[4].author).toEqual(2);
  expect(res.body.result.length).toBe(5);
});

test('GET all comments, page 1, limit 1', async () => {
  comments.push(new CommentEntity(3, 2, 0, 'Super post!1', 2));
  comments.push(new CommentEntity(4, 2, 0, 'Super post!2', 2));
  comments.push(new CommentEntity(5, 2, 0, 'Super post!3', 2));
  comments.push(new CommentEntity(6, 2, 0, 'Super post!4', 2));

  const res = await request(app).get('/api/comments?page=1&limit=1');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].id).toEqual(1);
  expect(res.body.result[0].postId).toEqual(1);
  expect(res.body.result[0].parentId).toEqual(0);
  expect(res.body.result[0].text).toEqual('Super post!');
  expect(res.body.result[0].author).toEqual(1);

  expect(res.body.result.length).toBe(1);
  expect(res.body.hasPrevious).toBeFalsy();
  expect(res.body.hasNext).toBeTruthy();
});

test('GET all comments, page 2, limit 2', async () => {
  comments.push(new CommentEntity(3, 2, 0, 'Super post!1', 2));
  comments.push(new CommentEntity(4, 2, 0, 'Super post!2', 2));

  const res = await request(app).get('/api/comments?page=2&limit=2');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));

  expect(res.body.result[0].id).toEqual(3);
  expect(res.body.result[0].postId).toEqual(2);
  expect(res.body.result[0].parentId).toEqual(0);
  expect(res.body.result[0].text).toEqual('Super post!1');
  expect(res.body.result[0].author).toEqual(2);
  expect(res.body.result[1].id).toEqual(4);
  expect(res.body.result[1].postId).toEqual(2);
  expect(res.body.result[1].parentId).toEqual(0);
  expect(res.body.result[1].text).toEqual('Super post!2');
  expect(res.body.result[1].author).toEqual(2);

  expect(res.body.result.length).toBe(2);
  expect(res.body.hasPrevious).toBeTruthy();
  expect(res.body.hasNext).toBeFalsy();
});

test('GET all comments name=super postId=2', async () => {
  comments.push(new CommentEntity(3, 2, 0, 'Super post!1', 2));
  comments.push(new CommentEntity(4, 2, 0, 'nope', 2));
  comments.push(new CommentEntity(5, 2, 0, 'Super post!2', 2));
  comments.push(new CommentEntity(6, 2, 0, 'Super post!3', 2));
  comments.push(new CommentEntity(7, 2, 0, 'Super post!4', 2));
  comments.push(new CommentEntity(8, 2, 0, 'Super post!5', 2));

  const res = await request(app).get('/api/comments?name=super&postId=2');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].id).toEqual(3);
  expect(res.body.result[0].postId).toEqual(2);
  expect(res.body.result[0].parentId).toEqual(0);
  expect(res.body.result[0].text).toEqual('Super post!1');
  expect(res.body.result[0].author).toEqual(2);
  expect(res.body.result[1].id).toEqual(5);
  expect(res.body.result[1].postId).toEqual(2);
  expect(res.body.result[1].parentId).toEqual(0);
  expect(res.body.result[1].text).toEqual('Super post!2');
  expect(res.body.result[1].author).toEqual(2);
  expect(res.body.result[2].id).toEqual(6);
  expect(res.body.result[2].postId).toEqual(2);
  expect(res.body.result[2].parentId).toEqual(0);
  expect(res.body.result[2].text).toEqual('Super post!3');
  expect(res.body.result[2].author).toEqual(2);
  expect(res.body.result[3].id).toEqual(7);
  expect(res.body.result[3].postId).toEqual(2);
  expect(res.body.result[3].parentId).toEqual(0);
  expect(res.body.result[3].text).toEqual('Super post!4');
  expect(res.body.result[3].author).toEqual(2);
  expect(res.body.result[4].id).toEqual(8);
  expect(res.body.result[4].postId).toEqual(2);
  expect(res.body.result[4].parentId).toEqual(0);
  expect(res.body.result[4].text).toEqual('Super post!5');
  expect(res.body.result[4].author).toEqual(2);
  expect(res.body.result.length).toBe(5);
});

test('GET comment wit id = 1', async () => {
  const res = await request(app).get('/api/comments/1');
  expect(res.body).toBeDefined();
  expect(res.body.id).toEqual(1);
  expect(res.body.postId).toEqual(1);
  expect(res.body.parentId).toEqual(0);
  expect(res.body.text).toEqual('Super post!');
  expect(res.body.author).toEqual(1);
});

test('GET comment wit id = 2', async () => {
  const res = await request(app).get('/api/comments/2');
  expect(res.body.id).toBe(2);
  expect(res.body.postId).toBe(2);
  expect(res.body.parentId).toBe(0);
  expect(res.body.text).toBe('Great !!!');
  expect(res.body.author).toBe(2);
  expect(res.body.author).not.toBe('blala');
});

test('GET by not exiting id', async () => {
  const res = await request(app).get('/api/comments/3');
  expect(res.statusCode).toBe(404);
});

test('POST comment by simple user', async () => {
  const res = await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 0,
      text: 'Super post!   Finally!',
    })
    .set('Authorization', `Bearer ${simpleToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.id).toBe(3);
  expect(res.body.postId).toBe(2);
  expect(res.body.parentId).toBe(0);
  expect(res.body.text).toBe('Super post!   Finally!');
  expect(res.body.author).toBe(1);
});

test('POST comment by admin', async () => {
  const res = await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 0,
      text: 'Super post!   Finally!',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.id).toBe(3);
  expect(res.body.postId).toBe(2);
  expect(res.body.parentId).toBe(0);
  expect(res.body.text).toBe('Super post!   Finally!');
  expect(res.body.author).toBe(3);
});

test('GET added comment with id = 3', async () => {
  const newComment = new CommentEntity(3, 2, 0, 'Super post!   Finally!', 2);
  comments.push(newComment);
  const res = await request(app).get('/api/comments/3');
  expect(res.body.id).toBe(3);
  expect(res.body.postId).toBe(2);
  expect(res.body.parentId).toBe(0);
  expect(res.body.text).toBe('Super post!   Finally!');
  expect(res.body.author).toBe(2);
});

test('PUT change text of comment with id =2, user is not owner ', async () => {
  const res = await request(app)
    .put('/api/comments/2')
    .send({
      text: 'Review comment!',
    })
    .set('Authorization', `Bearer ${simpleToken}`);

  expect(res.statusCode).toBe(403);
});

test('PUT change text of comment with id =2, user is admin ', async () => {
  const res = await request(app)
    .put('/api/comments/2')
    .send({
      text: 'Review comment!',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.id).toBe(2);
  expect(res.body.text).toBe('Review comment!');
  expect(res.body.author).toBe(2);
});

test('PUT request on wrong id  ', async () => {
  const res = await request(app)
    .put('/api/comments/5')
    .send({
      text: 'Review comment!',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('GET comment wit id = 1 after delete old comment with id =1', async () => {
  const res = await request(app).get('/api/comments/2');
  expect(res.body.id).toBe(2);
  expect(res.body.postId).toBe(2);
  expect(res.body.parentId).toBe(0);
  expect(res.body.author).toBe(2);
});

test('bad DELETE by id request', async () => {
  const res = await request(app)
    .delete('/api/comments/6')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('get comments by postId', async () => {
  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 2,
      text: 'Post2',
    })
    .set('Authorization', `Bearer ${simpleToken}`);
  const res = await request(app).get('/api/comments?postId=2');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));

  expect(res.body.result[0].id).toEqual(2);
  expect(res.body.result[0].postId).toEqual(2);
  expect(res.body.result[0].parentId).toEqual(0);
  expect(res.body.result[0].text).toEqual('Great !!!');
  expect(res.body.result[0].author).toEqual(2);

  expect(res.body.result[1].id).toEqual(3);
  expect(res.body.result[1].postId).toEqual(2);
  expect(res.body.result[1].parentId).toEqual(2);
  expect(res.body.result[1].text).toEqual('Post2');
  expect(res.body.result[1].author).toEqual(1);
});

test('bad get comments by postId', async () => {
  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 2,
      text: 'Post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);
  const res = await request(app).get('/api/comments?postId=3');

  expect(res.statusCode).toBe(200);
});

test('get comments by parentId', async () => {
  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 2,
      text: 'Post2',
    })
    .set('Authorization', `Bearer ${simpleToken}`);
  const res = await request(app).get('/api/comments?parentId=2');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].id).toEqual(3);
  expect(res.body.result[0].postId).toEqual(2);
  expect(res.body.result[0].parentId).toEqual(2);
  expect(res.body.result[0].text).toEqual('Post2');
  expect(res.body.result[0].author).toEqual(1);
});

test('bad get comments by parentId', async () => {
  const res = await request(app).get('/api/comments?parentId=3');

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toStrictEqual([]);
});

test('postId must be valid', async () => {
  const res = await request(app)
    .post('/api/comments')
    .send({
      postId: 3,
      parentId: 2,
      text: 'post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('parentId must be valid', async () => {
  const res = await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 3,
      text: 'post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('parent postId must be equal with current comment postId', async () => {
  const res = await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 1,
      text: 'post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('delete all comment replies', async () => {
  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 2,
      text: 'post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 2,
      text: 'post3',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  let res = await request(app).get('/api/comments');
  expect(res.body.result.length).toEqual(4);
  await request(app)
    .delete('/api/comments/2')
    .set('Authorization', `Bearer ${adminToken}`);

  res = await request(app).get('/api/comments');

  expect(res.body.result.length).toEqual(1);
});

test('delete all comment replies 3 tree depth', async () => {
  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 2,
      text: 'post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 3,
      text: 'post3',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  await request(app)
    .post('/api/comments')
    .send({
      postId: 2,
      parentId: 4,
      text: 'post4',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  let res = await request(app).get('/api/comments');
  expect(res.body.result.length).toEqual(5);
  await request(app)
    .delete('/api/comments/2')
    .set('Authorization', `Bearer ${adminToken}`);

  res = await request(app).get('/api/comments');

  expect(res.body.result.length).toEqual(1);
});

test('deleting post results in deleting all post comments', async () => {
  const token = createAuthToken(users[0]);
  await request(app)
    .post('/api/comments')
    .send({
      postId: 1,
      parentId: 1,
      text: 'post2',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  let res = await request(app).get('/api/comments');
  expect(res.body.result.length).toEqual(3);

  await request(app)
    .delete('/api/posts/1')
    .set('Authorization', `Bearer ${token}`);

  res = await request(app).get('/api/comments');
  expect(res.body.result.length).toEqual(1);
});

test('bad GET comments when db is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/comments');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad GET comment by id when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/comments/1');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad POST comment  when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).post('/api/comments').send({
    postId: 2,
    parentId: 3,
    text: 'post3',
    author: 'Master',
  });

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad PUT comment when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).put('/api/comments/1').send({
    postId: 1,
    parentId: 3,
    text: 'post3',
    author: 'updateMaster',
  });

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad DELETE comment when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/comments/delete/1');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});
