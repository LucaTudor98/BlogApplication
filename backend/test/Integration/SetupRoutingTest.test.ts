import request from 'supertest';
import app from '../../app';
import MockDB from '../../services/mockDbservice';

const db = new MockDB();

test('bad Setup  when db is already configured', async () => {
  db.setConfigValue(true);
  const res = await request(app).get('/setup');

  expect(res.statusCode).toBe(404);
  expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  expect(res.body).toEqual({ error: 'Database is already configured!' });
});

/* !!!!!update your own password and database when run the test

test('get Setup  when db is not configured', async () => {
  db.setConfigValue(false);
  const res = await request(app).get('/setup').send({
    user: 'root',
    password: '*****',
    database: '****',
  });

  expect(res.statusCode).toBe(200);
});
*/
