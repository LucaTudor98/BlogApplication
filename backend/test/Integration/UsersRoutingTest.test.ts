import request from 'supertest';
import jwt, { Secret } from 'jsonwebtoken';
import app from '../../app';
import { users } from '../../seeds/inmemDB';
import User from '../../models/dto/User';
import MockDB from '../../services/mockDbservice';

const db = new MockDB();

let adminToken: string;
let simpleToken: string;

function generateAccessToken(user: User) {
  const token = jwt.sign(
    {
      user,
    },
    process.env.TOKEN_SECRET as Secret,
    { expiresIn: '1h' }
  );

  return token;
}

function initializeUserDatabase() {
  users.push(new User(1, 'first', 'first@gmail.com', 'firstPassword', true));
  users.push(
    new User(2, 'second', 'second@gmail.com', 'secondPassword', false)
  );
  db.setConfigValue(true);

  adminToken = generateAccessToken(users[0]);
  simpleToken = generateAccessToken(users[1]);
}

function clearUserDatabase() {
  users.splice(0, users.length);
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

beforeAll(() => {
  clearUserDatabase();
});

beforeEach(() => {
  initializeUserDatabase();
});

afterEach(() => {
  clearUserDatabase();
});

test("POST user, can't create admin", async () => {
  const res = await request(app).post('/api/users').send({
    name: 'random',
    email: 'random@gmail.com',
    password: 'randomPassword',
    isAdmin: true,
  });

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.id).toEqual(3);
  expect(res.body.name).toEqual('random');
  expect(res.body.email).toEqual('random@gmail.com');
  expect(res.body.password).toEqual('randomPassword');
  expect(res.body.isAdmin).toBeFalsy();
});

test('POST user by admin', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'random',
      email: 'random@gmail.com',
      password: 'randomPassword',
      isAdmin: true,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.id).toEqual(3);
  expect(res.body.name).toEqual('random');
  expect(res.body.email).toEqual('random@gmail.com');
  expect(res.body.password).toEqual('randomPassword');
  expect(res.body.isAdmin).toBeTruthy();
});

test('incomplete User POST', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'Random',
      password: 'randomPass',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(400);
});

test('incomplete User POST', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'Random',
      password: 'randomPass',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(400);
});

test('incomplete User POST, isAdmin missing', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'Random',
      email: 'random@gmail.com',
      password: 'randomPass',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(400);
});

test('GET user by id, user is author', async () => {
  const res = await request(app)
    .get('/api/users/2')
    .set('Authorization', `Bearer ${simpleToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.name).toEqual(users[1].name);
  expect(res.body.email).toEqual(users[1].email);
  expect(res.body.password).toEqual(users[1].password);
  expect(res.body.isAdmin).toBeFalsy();
});

test('GET user by id, user is not admin or author', async () => {
  const res = await request(app)
    .get('/api/users/1')
    .set('Authorization', `Bearer ${simpleToken}`);

  expect(res.statusCode).toBe(403);
});

test('GET user by id, user is admin', async () => {
  const res = await request(app)
    .get('/api/users/1')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.name).toEqual(users[0].name);
  expect(res.body.email).toEqual(users[0].email);
  expect(res.body.password).toEqual(users[0].password);
  expect(res.body.isAdmin).toBeTruthy();
});

test('bad GET by id request', async () => {
  const res = await request(app)
    .get('/api/users/4')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('GET users, by admin, only 2 users in list', async () => {
  const res = await request(app)
    .get('/api/users?page=1&limit=2')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('first');
  expect(res.body.result[0].email).toEqual('first@gmail.com');
  expect(res.body.result[0].password).toEqual('firstPassword');
  expect(res.body.result[0].isAdmin).toBeTruthy();
  expect(res.body.result[1].name).toEqual('second');
  expect(res.body.result[1].email).toEqual('second@gmail.com');
  expect(res.body.result[1].password).toEqual('secondPassword');
  expect(res.body.result[1].isAdmin).toBeFalsy();
  expect(res.body.hasNext).toBeFalsy();
  expect(res.body.hasPrevious).toBeFalsy();
});

test('GET users, by admin, only 2 users in list, limit is 5', async () => {
  const res = await request(app)
    .get('/api/users?page=1&limit=5')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('first');
  expect(res.body.result[0].email).toEqual('first@gmail.com');
  expect(res.body.result[0].password).toEqual('firstPassword');
  expect(res.body.result[0].isAdmin).toBeTruthy();
  expect(res.body.result[1].name).toEqual('second');
  expect(res.body.result[1].email).toEqual('second@gmail.com');
  expect(res.body.result[1].password).toEqual('secondPassword');
  expect(res.body.result[1].isAdmin).toBeFalsy();
  expect(res.body.result[2]).toBeUndefined();
  expect(res.body.hasNext).toBeFalsy();
  expect(res.body.hasPrevious).toBeFalsy();
});

test('GET users, by admin, only 2 users in list, page 1, limit 1', async () => {
  const res = await request(app)
    .get('/api/users?page=1&limit=1')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('first');
  expect(res.body.result[0].email).toEqual('first@gmail.com');
  expect(res.body.result[0].password).toEqual('firstPassword');
  expect(res.body.result[0].isAdmin).toBeTruthy();
  expect(res.body.hasNext).toBeTruthy();
  expect(res.body.hasPrevious).toBeFalsy();
});

test('GET users, by admin, only 2 users in list, page 2, limit 1', async () => {
  const res = await request(app)
    .get('/api/users?page=2&limit=1')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('second');
  expect(res.body.result[0].email).toEqual('second@gmail.com');
  expect(res.body.result[0].password).toEqual('secondPassword');
  expect(res.body.result[0].isAdmin).toBeFalsy();
  expect(res.body.hasNext).toBeFalsy();
  expect(res.body.hasPrevious).toBeTruthy();
});

test('GET users, by admin, only 2 users in list, page 2, limit 1', async () => {
  await request(app)
    .post('/api/users')
    .send({
      name: 'random',
      email: 'random@gmail.com',
      password: 'randomPassword',
      isAdmin: false,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  const res = await request(app)
    .get('/api/users?page=2&limit=1')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('second');
  expect(res.body.result[0].email).toEqual('second@gmail.com');
  expect(res.body.result[0].password).toEqual('secondPassword');
  expect(res.body.result[0].isAdmin).toBeFalsy();
  expect(res.body.hasNext).toBeTruthy();
  expect(res.body.hasPrevious).toBeTruthy();
});

test('GET users, middle user in list does not match search', async () => {
  await request(app)
    .post('/api/users')
    .send({
      name: 'fi',
      email: 'zzzz@gmail.com',
      password: 'randomPassword',
      isAdmin: false,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  const res = await request(app)
    .get('/api/users?page=1&limit=5&name=fi')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('first');
  expect(res.body.result[0].email).toEqual('first@gmail.com');
  expect(res.body.result[0].password).toEqual('firstPassword');
  expect(res.body.result[0].isAdmin).toBeTruthy();
  expect(res.body.result[1].name).toEqual('fi');
  expect(res.body.result[1].email).toEqual('zzzz@gmail.com');
  expect(res.body.result[1].password).toEqual('randomPassword');
  expect(res.body.result[1].isAdmin).toBeFalsy();
  expect(res.body.hasNext).toBeFalsy();
  expect(res.body.hasPrevious).toBeFalsy();
});

test('GET users, name given does not match name or email in list', async () => {
  const res = await request(app)
    .get('/api/users?page=1&limit=2&name=SomethingThatIsIncorrect')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result).toEqual([]);
  expect(res.body.hasNext).toBeFalsy();
  expect(res.body.hasPrevious).toBeFalsy();
});

test('GET users, by simple user', async () => {
  const res = await request(app)
    .get('/api/users?page=1&limit=5')
    .set('Authorization', `Bearer ${simpleToken}`);

  expect(res.statusCode).toBe(403);
});

test('search users, by admin', async () => {
  await request(app)
    .post('/api/users')
    .send({
      name: 'random',
      email: 'random@gmail.com',
      password: 'randomPassword',
      isAdmin: false,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  await request(app)
    .post('/api/users')
    .send({
      name: 'notOrm',
      email: 'notRandtom@gmail.com',
      password: 'notOrmPassword',
      isAdmin: false,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  await request(app)
    .post('/api/users')
    .send({
      name: 'random',
      email: 'random@gmail.com',
      password: 'randomPassword',
      isAdmin: false,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  const res = await request(app)
    .get('/api/users/?page=1&limit=2&name=random')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body.result[0].name).toEqual('random');
  expect(res.body.result[0].email).toEqual('random@gmail.com');
  expect(res.body.result[0].password).toEqual('randomPassword');
  expect(res.body.result[0].isAdmin).toBeFalsy();
  expect(res.body.result[1].name).toEqual('random');
  expect(res.body.result[1].email).toEqual('random@gmail.com');
  expect(res.body.result[1].password).toEqual('randomPassword');
  expect(res.body.result[1].isAdmin).toBeFalsy();
  expect(res.body.result[2]).toBeUndefined();
});

test('PUT change only name information by admin', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      name: 'new name',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toEqual('new name');
  expect(res.body.email).toEqual('second@gmail.com');
  expect(res.body.password).toEqual('secondPassword');
  expect(res.body.isAdmin).toBeFalsy();
});

test('PUT change only name information by simple user', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      name: 'new name',
    })
    .set('Authorization', `Bearer ${simpleToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toEqual('new name');
  expect(res.body.email).toEqual('second@gmail.com');
  expect(res.body.password).toEqual('secondPassword');
  expect(res.body.isAdmin).toBeFalsy();
});

test('PUT change only email information', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      email: 'newMail@gmail.com',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toEqual('second');
  expect(res.body.email).toEqual('newMail@gmail.com');
  expect(res.body.password).toEqual('secondPassword');
  expect(res.body.isAdmin).toBeFalsy();
});

test('PUT change only password information', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      password: 'newPassword',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toEqual('second');
  expect(res.body.email).toEqual('second@gmail.com');
  expect(res.body.password).toEqual('newPassword');
  expect(res.body.isAdmin).toBeFalsy();
});

test('PUT change only isAdmin information', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      isAdmin: true,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toEqual('second');
  expect(res.body.email).toEqual('second@gmail.com');
  expect(res.body.password).toEqual('secondPassword');
  expect(res.body.isAdmin).toBeTruthy();
});

test('PUT change only isAdmin information', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      isAdmin: true,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toEqual('second');
  expect(res.body.email).toEqual('second@gmail.com');
  expect(res.body.password).toEqual('secondPassword');
  expect(res.body.isAdmin).toBeTruthy();
});

test('PUT change all information', async () => {
  const res = await request(app)
    .put('/api/users/2')
    .send({
      name: 'something',
      email: 'something@gmail.com',
      password: 'somePassword',
      isAdmin: true,
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.body.name).toEqual('something');
  expect(res.body.email).toEqual('something@gmail.com');
  expect(res.body.password).toEqual('somePassword');
  expect(res.body.isAdmin).toBeTruthy();
});

test('incomplete PUT request', async () => {
  const token = createAuthToken(users[0]);
  const res = await request(app)
    .put('/api/posts/1')
    .set('Authorization', `Bearer ${token}`)
    .send({});

  expect(res.statusCode).toBe(400);
});

test('PUT, id is missing', async () => {
  const res = await request(app)
    .put('/api/posts')
    .send({
      name: 'something',
      email: 'something@gmail.com',
      password: 'somePassword',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('wrong PUT id', async () => {
  const res = await request(app)
    .put('/api/posts/4')
    .send({
      name: 'newName',
      email: 'newMail',
    })
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(400);
});

test('Delete user successful', async () => {
  const res = await request(app)
    .delete('/api/users/2')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.body[1]).toBeUndefined();
});

test('bad DELETE by wrong ID', async () => {
  const res = await request(app)
    .delete('/api/users/4')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('DELETE, id is missing', async () => {
  const res = await request(app)
    .delete('/api/users/4')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(404);
});

test('bad GET users', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/users');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad GET user by id when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/users/1');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad POST user  when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).post('/api/users').send({
    name: 'random',
    email: 'random@gmail.com',
    password: 'randomPassword',
  });

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad PUT user when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).put('/api/users/2').send({
    name: 'something',
    email: 'something@gmail.com',
    password: 'somePassword',
  });

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});

test('bad DELETE  when database is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/api/users/delete/1');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is not configured!' });
});
