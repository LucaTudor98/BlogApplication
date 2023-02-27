import request from 'supertest';
import jwt, { Secret } from 'jsonwebtoken';
import app from '../../app';
import { users, posts } from '../../seeds/inmemDB';
import User from '../../models/dto/User';
import Post from '../../models/dto/Post';
import MockDB from '../../services/mockDbservice';

const db = new MockDB();

const imageBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

function initializeUsers() {
  users.push(new User(1, 'random1', 'random1@gmail.com', 'password1', false));
  users.push(new User(2, 'random2', 'random2@gmail.com', 'password2', false));
  users.push(new User(3, 'random3', 'random3@gmail.com', 'password3', true));
  db.setConfigValue(true);
}

function initializePosts() {
  posts.push(
    new Post(1, 'First post', 'My first post', 1, new Date(), new Date())
  );
  posts.push(
    new Post(
      2,
      'Second post',
      'My second post',
      1,
      new Date(),
      new Date(),
      imageBase64
    )
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

function resetUsersAndPosts() {
  users.splice(0, users.length);
  posts.splice(0, posts.length);
}

beforeAll(() => {
  resetUsersAndPosts();
});

beforeEach(() => {
  initializeUsers();
  initializePosts();
});

afterEach(() => {
  resetUsersAndPosts();
});

test('POST posts', async () => {
  const token = createAuthToken(users[2]);
  const res = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'new title',
      content: 'New PUT',
    });

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.title).toEqual('new title');
  expect(res.body.content).toEqual('New PUT');
  expect(res.body.author).toEqual(3);
});

test('POST posts with image', async () => {
  const token = createAuthToken(users[2]);
  const res = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'new title',
      content: 'New PUT',
      fileName: imageBase64,
    });

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.title).toEqual('new title');
  expect(res.body.content).toEqual('New PUT');
  expect(res.body.author).toEqual(3);
  expect(res.body.image).toEqual(imageBase64);
});

test('incomplete POST request, title is missing', async () => {
  const token = createAuthToken(users[2]);
  const res = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      content: 'New PUT',
    });

  expect(res.statusCode).toBe(400);
});

test('incomplete POST request, content is missing', async () => {
  const token = createAuthToken(users[2]);
  const res = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'New PUT',
    });

  expect(res.statusCode).toBe(400);
});

test('incomplete POST request, author not logged in', async () => {
  const res = await request(app).post('/api/posts').send({
    content: 'New PUT',
    title: 'New PUT',
  });

  expect(res.statusCode).toBe(401);
});

test('GET posts', async () => {
  const res = await request(app).get('/api/posts?page=1&limit=5');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[1].title).toEqual('Second post');
  expect(res.body.result[1].content).toEqual('My second post');
  expect(res.body.result[1].author).toEqual(1);
  expect(res.body.result[1].image).toEqual(imageBase64);
});

test('GET posts with search empty', async () => {
  const res = await request(app).get('/api/posts?search=&page=1&limit=5');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[1].title).toEqual('Second post');
  expect(res.body.result[1].content).toEqual('My second post');
  expect(res.body.result[1].author).toEqual(1);
});

test('GET posts with search title match', async () => {
  const res = await request(app).get(
    '/api/posts?search=First Post&page=1&limit=5'
  );

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].title).toEqual('First post');
  expect(res.body.result[0].content).toEqual('My first post');
  expect(res.body.result[0].author).toEqual(1);
  expect(res.body.result.length).toBe(1);
});

test('GET posts with search content match', async () => {
  const res = await request(app).get(
    '/api/posts?search=MY FIRST Post&page=1&limit=5'
  );

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].title).toEqual('First post');
  expect(res.body.result[0].content).toEqual('My first post');
  expect(res.body.result[0].author).toEqual(1);
  expect(res.body.result.length).toBe(1);
});

test('GET posts with search user match', async () => {
  const res = await request(app).get(
    '/api/posts?search=random1&page=1&limit=5'
  );

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].title).toEqual('First post');
  expect(res.body.result[0].content).toEqual('My first post');
  expect(res.body.result[0].author).toEqual(1);
  expect(res.body.result[1].title).toEqual('Second post');
  expect(res.body.result[1].content).toEqual('My second post');
  expect(res.body.result[1].author).toEqual(1);
  expect(res.body.result.length).toBe(2);
});

test('GET posts with no search match returns empty and 200', async () => {
  const res = await request(app).get(
    '/api/posts?search=sahfuhasf&page=1&limit=5'
  );

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result.length).toBe(0);
});

test('GET by id', async () => {
  const res = await request(app).get('/api/posts/1');

  expect(res.body).toBeDefined();
  expect(res.body.author).toBe(1);
});

test('bad GET by id request', async () => {
  const res = await request(app).get('/api/posts/10');

  expect(res.statusCode).toBe(404);
});

test('PUT, should change content from "My second post" to "new test" on id = 2', async () => {
  const token = createAuthToken(users[0]);
  const res = await request(app)
    .put('/api/posts/2')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'new title',
      content: 'new test',
    });

  expect(res.body.title).toEqual('new title');
  expect(res.body.content).toEqual('new test');
  expect(res.body.author).toEqual(1);
});

test('PUT, should change image on id = 2', async () => {
  const token = createAuthToken(users[0]);
  const updatedImageBase64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CWRQWERQYII=';
  const res = await request(app)
    .put('/api/posts/2')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'new title',
      content: 'new test',
      fileName: updatedImageBase64,
    });

  expect(res.body.title).toEqual('new title');
  expect(res.body.content).toEqual('new test');
  expect(res.body.author).toEqual(1);
  expect(res.body.image).toBe(updatedImageBase64);
});

test('incomplete PUT request, content is missing', async () => {
  const token = createAuthToken(users[0]);
  const res = await request(app)
    .put('/api/posts/1')
    .set('Authorization', `Bearer ${token}`)
    .send({});

  expect(res.statusCode).toBe(400);
});

test('PUT request on wrong id', async () => {
  const token = createAuthToken(users[0]);
  const res = await request(app)
    .put('/api/posts/10')
    .set('Authorization', `Bearer ${token}`)
    .send({
      content: 'New PUT',
    });

  expect(res.statusCode).toBe(404);
});

test('PUT request when not owner or admin should return 403', async () => {
  const token = createAuthToken(users[1]);

  const res = await request(app)
    .put('/api/posts/1')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'new title',
      content: 'new test',
    });

  expect(res.statusCode).toBe(403);
});

test('PUT request should be successful when user is admin', async () => {
  const token = createAuthToken(users[2]);

  const res = await request(app)
    .put('/api/posts/1')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'new title',
      content: 'new test',
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.title).toEqual('new title');
  expect(res.body.content).toEqual('new test');
});

test('should DELETE user with id 2', async () => {
  const token = createAuthToken(users[0]);
  const res = await request(app)
    .delete('/api/posts/2')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect((await request(app).get('/api/posts')).body[2]).toBeUndefined();
});

test('delete when admin should be successful', async () => {
  const token = createAuthToken(users[2]);
  const res = await request(app)
    .delete('/api/posts/2')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect((await request(app).get('/api/posts')).body[2]).toBeUndefined();
});

test('delete when not admin or owner should return 403', async () => {
  const token = createAuthToken(users[1]);
  const res = await request(app)
    .delete('/api/posts/2')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(403);
});

test('bad DELETE by id request', async () => {
  const token = createAuthToken(users[0]);
  const res = await request(app)
    .delete('/api/posts/6')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(404);
});

test('Deleting user should delete posts to', async () => {
  const token = createAuthToken(users[2]);
  let userRes = await request(app)
    .get('/api/users/1')
    .set('Authorization', `Bearer ${token}`);
  expect(userRes.statusCode).toBe(200);
  expect(userRes.body.name).toBe('random1');

  let postRes = await request(app).get('/api/posts/1');
  expect(postRes.statusCode).toBe(200);
  expect(postRes.body.content).toBe('My first post');
  expect(postRes.body.content).toBe('My first post');
  expect(postRes.body.author).toBe(1);

  userRes = await request(app)
    .delete('/api/users/1')
    .set('Authorization', `Bearer ${token}`);
  expect(userRes.statusCode).toBe(200);

  userRes = await request(app)
    .get('/api/users/1')
    .set('Authorization', `Bearer ${token}`);
  expect(userRes.statusCode).toBe(404);

  postRes = await request(app).get('/api/posts/1');
  expect(postRes.statusCode).toBe(404);
});

test('bad GET posts when db is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/posts');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad GET post by id when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/posts/1');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad POST post  when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).post('/api/posts').send({
    title: 'new title',
    content: 'New PUT',
    author: '3',
  });

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad PUT post when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).put('/api/posts/1').send({
    title: 'new title',
    content: 'Update PUT',
    author: '1',
  });

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad DELETE post when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/posts/delete/1');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});
