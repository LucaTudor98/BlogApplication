import { Request, Response } from 'express';
import { Readable } from 'stream';
import UserController from '../../controllers/UsersController';
import CommentEntity from '../../models/dto/CommentEntity';
import Post from '../../models/dto/Post';
import User from '../../models/dto/User';
import { users, comments, posts } from '../../seeds/inmemDB';

const { length } = users;
const { id } = users[users.length - 1];
type JSONResponse = {
  id: number;
  name?: string;
  email?: string;
  isAdmin?: boolean;
  password?: string;
  dateCreated: Date;
  dateModified: Date;
  message: string;
  result?: User;
  imgPath?: string;
};

let mockRes: Partial<Response>;
let mockReq: Partial<Request>;
let controller: UserController;
let responseObj = <JSONResponse>{};
let userObj: User;

const generatedImageName = '1654372764719-492611119.png';
const newGeneratedImageName = '1654372764719-492611229.png';

function initializeUsers() {
  userObj = new User(
    id + 2,
    'random2',
    'random2@gmail.com',
    'password2',
    false
  );

  users.push(
    new User(id + 1, 'random1', 'random1@gmail.com', 'password1', false)
  );
  users.push(userObj);
  users.push(
    new User(id + 3, 'random3', 'random3@gmail.com', 'password3', false)
  );
}

function resetUsers() {
  users.splice(length, 3);
}

beforeEach(() => {
  initializeUsers();
  controller = new UserController();

  mockReq = {};
  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((JSONdata) => {
      responseObj = JSONdata;
    }),
  };
});

afterEach(() => {
  resetUsers();
  responseObj = <JSONResponse>{};
  jest.resetAllMocks();
});

test('valid getAll, should return new users that were added', async () => {
  mockReq = { isAdmin: true, query: { page: '1', limit: '5' }, body: {} };

  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((JSONdata) => {
      responseObj = JSONdata;
    }),
  };

  await controller.getAll(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.result).toStrictEqual(users);
});

test('valid get, should return new user that was added', async () => {
  mockReq = {
    params: { id: (id + 2).toString() },
    isAdmin: true,
  };

  await controller.get(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj).toBe(userObj);
});

test('invalid get, user is not admin => 403', async () => {
  mockReq = {
    params: { id: (id + 2).toString() },
    isAdmin: false,
  };

  await controller.get(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(403);
});

test('invalid get, not admin, should return 403', async () => {
  mockReq = {
    params: { id: (id + 2).toString() },
    isAdmin: false,
  };

  await controller.get(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(403);
});

test('invalid get by id, id not found, should return message for user', async () => {
  mockReq = {
    isAdmin: true,
    params: { id: (id + 10).toString() },
  };

  await controller.get(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(404);
  expect(responseObj.message).toBe('The user was not found');
});

test('invalid get by id, no id given, should return message for user', async () => {
  mockReq = {
    isAdmin: true,
    params: {},
  };
  await controller.get(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Id is not a number');
});

test('invalid get by id, id is not a number, should return message for user', async () => {
  mockReq = {
    isAdmin: true,
    params: { id: 'hello' },
  };
  await controller.get(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Id is not a number');
});

test('valid Add, sender is admin, should return added obj', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'Ana',
      email: 'HelloAna@gmail.com',
      password: 'secretAna',
      isAdmin: false,
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 4);
  expect(responseObj.name).toBe('Ana');
  expect(responseObj.email).toBe('HelloAna@gmail.com');
  expect(responseObj.password).toBe('secretAna');
  expect(responseObj.isAdmin).toBeFalsy();

  users.splice(length + 3, 1);
});

test('Sender is not admin, and tries to ADD admin, should creat not admin user', async () => {
  mockReq = {
    isAdmin: false,
    body: {
      name: 'Ana',
      email: 'HelloAna@gmail.com',
      password: 'secretAna',
      isAdmin: true,
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 4);
  expect(responseObj.name).toBe('Ana');
  expect(responseObj.email).toBe('HelloAna@gmail.com');
  expect(responseObj.password).toBe('secretAna');
  expect(responseObj.isAdmin).toBeFalsy();

  users.splice(length + 3, 1);
});

test('invalid Add, name is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      email: 'HelloAna@gmail.com',
      password: 'secretAna',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, email is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'Ana',
      password: 'secretAna',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, password is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'Ana',
      email: 'HelloAna@gmail.com',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, isAdmin is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'Ana',
      password: 'secretAna',
      email: 'HelloAna@gmail.com',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, name and email is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      password: 'secretAna',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, name and password is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      email: 'HelloAna@gmail.com',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, email and password is missing, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'Ana',
    },
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('invalid Add, no body given, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {},
  };

  await controller.add(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('Some data is missing');
});

test('add Image, imgPath should be given path', async () => {
  mockReq = {
    isAdmin: true,
    body: {},
    file: {
      path: `images\\${generatedImageName}`,
      fieldname: '',
      originalname: '',
      encoding: '',
      mimetype: '',
      size: 0,
      stream: new Readable(),
      destination: '',
      filename: generatedImageName,
      buffer: Buffer.alloc(0),
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('random2');
  expect(responseObj.email).toBe('random2@gmail.com');
  expect(responseObj.password).toBe('password2');
  expect(responseObj.isAdmin).toBeFalsy();
  expect(responseObj.imgPath).toBe(generatedImageName);
});

test('update Image, imgPath should be new path', async () => {
  mockReq = {
    isAdmin: true,
    body: {},
    file: {
      path: `images\\${newGeneratedImageName}`,
      fieldname: '',
      originalname: '',
      encoding: '',
      mimetype: '',
      size: 0,
      stream: new Readable(),
      destination: '',
      filename: newGeneratedImageName,
      buffer: Buffer.alloc(0),
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('random2');
  expect(responseObj.email).toBe('random2@gmail.com');
  expect(responseObj.password).toBe('password2');
  expect(responseObj.isAdmin).toBeFalsy();
  expect(responseObj.imgPath).toBe(newGeneratedImageName);
});

test('valid update on all properties, should return updated obj', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gmail.com',
      password: 'updatedPassword',
      isAdmin: true,
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('updatedName');
  expect(responseObj.email).toBe('updatedEmail@gmail.com');
  expect(responseObj.password).toBe('updatedPassword');
  expect(responseObj.isAdmin).toBeTruthy();
});

test('invalid update, user is not author => 403', async () => {
  mockReq = {
    isAdmin: false,
    userId: id + 1,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gmail.com',
      password: 'updatedPassword',
      isAdmin: true,
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(403);
});

test('valid update, should return updated obj', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gmail.com',
      password: 'updatedPassword',
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('updatedName');
  expect(responseObj.email).toBe('updatedEmail@gmail.com');
  expect(responseObj.password).toBe('updatedPassword');
  expect(responseObj.isAdmin).toBeFalsy();
});

test('valid update, user is author', async () => {
  mockReq = {
    isAdmin: false,
    userId: id + 2,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gmail.com',
      password: 'updatedPassword',
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('updatedName');
  expect(responseObj.email).toBe('updatedEmail@gmail.com');
  expect(responseObj.password).toBe('updatedPassword');
  expect(responseObj.isAdmin).toBeFalsy();
});

test('valid update, name should not be updated', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      email: 'updatedEmail@gmail.com',
      password: 'updatedPassword',
    },
    params: { id: (id + 2).toString() },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('random2');
  expect(responseObj.email).toBe('updatedEmail@gmail.com');
  expect(responseObj.password).toBe('updatedPassword');
  expect(responseObj.isAdmin).toBeFalsy();
});

test('valid update, email should not be updated', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'updatedName',
      password: 'updatedPassword',
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('updatedName');
  expect(responseObj.email).toBe('random2@gmail.com');
  expect(responseObj.password).toBe('updatedPassword');
  expect(responseObj.isAdmin).toBeFalsy();
});

test('valid update, password should not be updated', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gmail.com',
    },
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(responseObj.id).toBe(id + 2);
  expect(responseObj.name).toBe('updatedName');
  expect(responseObj.email).toBe('updatedEmail@gmail.com');
  expect(responseObj.password).toBe('password2');
  expect(responseObj.isAdmin).toBeFalsy();
});

test('invalid update, id is missing in params, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gamil.com',
      password: 'updatedPassword',
    },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('User id is missing');
});

test('invalid update, invalid id, should return message', async () => {
  mockReq = {
    isAdmin: true,
    body: {
      name: 'updatedName',
      email: 'updatedEmail@gamil.com',
      password: 'updatedPassword',
    },
    params: { id: '200' },
  };

  await controller.update(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(404);
  expect(responseObj.message).toBe('User id is invalid');
});

test('valid delete, user is admin, should return status 200', async () => {
  mockReq = {
    isAdmin: true,
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.delete(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);

  await controller.get(mockReq as Request, mockRes as Response);

  expect(responseObj.message).toBe('The user was not found');
});

test('invalid delete, user is not author => 403', async () => {
  mockReq = {
    isAdmin: false,
    userId: id + 1,
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.delete(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(403);
});

test('valid delete, user is author => 200', async () => {
  mockReq = {
    isAdmin: false,
    userId: id + 2,
    params: {
      id: (id + 2).toString(),
    },
  };

  await controller.delete(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
});

test('valid delete, should delete user posts, comments, replies from post', async () => {
  users.push(
    new User(id + 4, 'random4', 'random4@gmail.com', 'password4', false)
  );
  const postId = posts[posts.length - 1].id;
  const commentId = comments[comments.length - 1].id;

  posts.push(
    new Post(postId + 1, 'test', 'test', id + 3, new Date(), new Date())
  );
  comments.push(
    new CommentEntity(commentId + 1, postId + 1, 0, 'test', id + 3)
  );
  comments.push(
    new CommentEntity(commentId + 2, postId + 1, commentId + 1, 'test', id + 3)
  );

  mockReq = {
    isAdmin: true,
    params: {
      id: (id + 3).toString(),
    },
  };

  await controller.delete(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(200);
  expect(posts.find((x) => x.id === postId + 1)).toBeUndefined();
  expect(comments.find((x) => x.postId === postId + 1)).toBeUndefined();
});

test('invalid delete, id is invalid', async () => {
  mockReq = {
    isAdmin: true,
    params: {
      id: '200',
    },
  };

  await controller.delete(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(404);
  expect(responseObj.message).toBe('The user was not found');
});

test('invalid delete, id is missing', async () => {
  await controller.delete(mockReq as Request, mockRes as Response);

  expect(mockRes.status).toBeCalledWith(400);
  expect(responseObj.message).toBe('User id is missing');
});
