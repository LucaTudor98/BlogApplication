import { Request, Response } from 'express';
import { users, posts } from '../../seeds/inmemDB';
import User from '../../models/dto/User';
import Post from '../../models/dto/Post';
import PostsController from '../../controllers/PostsController';

let lengthInitUsers = 0;
let lengthInitPosts = 0;
const imageBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

function addTestPosts() {
  let firstId: number;
  lengthInitPosts = posts.length;
  if (posts.length === 0) {
    firstId = 1;
  } else {
    firstId = (posts[posts.length - 1].id as number) + 1;
  }

  posts.push(
    new Post(firstId, 'First post', 'My first post', 2, new Date(), new Date())
  );
  posts.push(
    new Post(
      (posts[posts.length - 1].id as number) + 1,
      'Second post',
      'My second post',
      2,
      new Date(),
      new Date(),
      imageBase64
    )
  );
}

function addTestUsers() {
  let firstId: number;
  lengthInitUsers = users.length;
  if (users.length === 0) {
    firstId = 1;
  } else {
    firstId = (users[users.length - 1].id as number) + 1;
  }
  users.push(
    new User(firstId, 'random1', 'random1@gmail.com', 'password1', false)
  );
  users.push(
    new User(
      (users[users.length - 1].id as number) + 1,
      'random2',
      'random2@gmail.com',
      'password2',
      false
    )
  );
  users.push(
    new User(
      (users[users.length - 1].id as number) + 1,
      'random3',
      'random3@gmail.com',
      'password3',
      false
    )
  );
}

function resetUsersAndPostsAddedFromTesting() {
  users.splice(lengthInitUsers, users.length);
  posts.splice(lengthInitPosts, posts.length);
}

beforeAll(() => {
  resetUsersAndPostsAddedFromTesting();
});

beforeEach(() => {
  addTestPosts();
  addTestUsers();
});

afterEach(() => {
  resetUsersAndPostsAddedFromTesting();
});

test('get post by id not existing> should be 404 ', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = (lastId + 1).toString();
  const req: Partial<Request> = {
    params: { id: checkId },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.get(req as Request, res as Response);
  expect(res.status).toBeCalledWith(404);
  expect(res.json).toBeCalledWith({
    error: `No post with id number ${checkId} was found`,
  });
});

test('get post by id > should be 200 ', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    params: { id: checkId },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.get(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith(posts[lastId - 1]);
});

test('get posts', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    query: {
      page: '1',
      limit: '5',
    },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.getAll(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: posts,
  });
});

test('get post with image', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    query: { page: '1', limit: '5' },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await postsController.getAll(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: posts,
  });

  expect(posts[0].image).toBe(undefined);
  expect(posts[1].image).toBe(imageBase64);
});

test('get posts by search - title match', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    query: { search: 'first post', page: '1', limit: '5' },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.getAll(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: [posts[0]],
  });
});

test('get posts by search - content match', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    query: { search: 'my first post', page: '1', limit: '5' },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.getAll(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: [posts[0]],
  });
});

test('get posts by search - user match', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    query: { search: 'random2', page: '1', limit: '5' },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.getAll(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: posts,
  });
});

test('add a post succesfully', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const req: Partial<Request> = {
    body: {
      title: 'new title',
      content: 'New PUT',
    },
    isAdmin: false,
    userId: 3,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await postsController.add(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect((await postsController.postsService.get(lastId + 1)).title).toBe(
    'new title'
  );
  expect((await postsController.postsService.get(lastId + 1)).content).toBe(
    'New PUT'
  );
  expect(res.json).toBeCalledWith(posts[posts.length - 1]);
});

test('add a post with image succesfully', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const req: Partial<Request> = {
    body: {
      title: 'new title',
      content: 'New PUT',
      fileName: imageBase64,
    },
    isAdmin: false,
    userId: 3,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await postsController.add(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  expect((await postsController.postsService.get(lastId + 1)).title).toBe(
    'new title'
  );
  expect((await postsController.postsService.get(lastId + 1)).content).toBe(
    'New PUT'
  );
  expect((await postsController.postsService.get(lastId + 1)).image).toBe(
    imageBase64
  );
  expect(res.json).toBeCalledWith(posts[posts.length - 1]);
});

test('add a post incomplete->should be 400', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    body: {
      title: 'new title',
    },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.add(req as Request, res as Response);
  expect(res.status).toBeCalledWith(400);
  expect(res.json).toBeCalledWith({ error: 'Some data is missing' });
});

test('add a post with an not-existing user-should be 404', async () => {
  const postsController: PostsController = new PostsController();
  const req: Partial<Request> = {
    body: {
      title: 'new title',
      content: 'New PUT',
    },
    userId: 4,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.add(req as Request, res as Response);
  expect(res.status).toBeCalledWith(404);
  expect(res.json).toBeCalledWith({
    error: 'No user with id number 4 was found',
  });
});

test('updated a post while not an admin -> returns 403', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
    },
    params: { id: checkId },
    isAdmin: false,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await postsController.update(req as Request, res as Response);
  expect(res.status).toBeCalledWith(403);
});

test('updated a post while not an owner -> returns 403', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
    },
    params: { id: checkId },
    userId: 1,
    isAdmin: false,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await postsController.update(req as Request, res as Response);
  expect(res.status).toBeCalledWith(403);
});

test('update a post succesfully as owner', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
    },
    params: { id: checkId },
    userId: 2,
    isAdmin: false,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.update(req as Request, res as Response);
  const updatedPost = await postsController.postsService.get(lastId);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith(updatedPost);
  expect(updatedPost.content).toBe('Update content');
});

test('update a post succesfully as admin', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
    },
    params: { id: checkId },
    isAdmin: true,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.update(req as Request, res as Response);
  const updatedPost = await postsController.postsService.get(lastId);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith(updatedPost);
  expect(updatedPost.content).toBe('Update content');
});

test('update a post without a image with a new image succesfully as admin', async () => {
  const postsController: PostsController = new PostsController();
  const firstPostTestId: number = posts[posts.length - 2].id as number;
  const checkId: string = firstPostTestId.toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
      fileName: imageBase64,
    },
    params: { id: checkId },
    isAdmin: true,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.update(req as Request, res as Response);
  const updatedPost = await postsController.postsService.get(firstPostTestId);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith(updatedPost);
  expect(updatedPost.content).toBe('Update content');
  expect(updatedPost.image).toBe(imageBase64);
});

test('update a post with an existing image with a new image succesfully as admin', async () => {
  const postsController: PostsController = new PostsController();
  const updatedImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=BBBBAAAA';
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
      fileName: updatedImage,
    },
    params: { id: checkId },
    isAdmin: true,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.update(req as Request, res as Response);
  const updatedPost = await postsController.postsService.get(lastId);
  expect(res.status).toBeCalledWith(200);
  expect(res.json).toBeCalledWith(updatedPost);
  expect(updatedPost.content).toBe('Update content');
  expect(updatedPost.image).toBe(updatedImage);
});

test('update a post with non-existing Id-> should be 404', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = (lastId + 1).toString();
  const req: Partial<Request> = {
    body: {
      content: 'Update content',
    },
    params: { id: checkId },
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  await postsController.update(req as Request, res as Response);
  expect(res.status).toBeCalledWith(404);
  expect(res.json).toBeCalledWith({
    error: `No post with id number ${checkId} was found`,
  });
});

test('delete a post with non-existing Id-> should be 404', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = (lastId + 1).toString();
  const req: Partial<Request> = {
    params: { id: checkId },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.delete(req as Request, res as Response);
  expect(res.status).toBeCalledWith(404);
  expect(res.json).toBeCalledWith({
    error: `No post with id number ${checkId} was found`,
  });
});

test('delete an existing post as owner succesfuly', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    params: { id: checkId },
    userId: 2,
    isAdmin: false,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.delete(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  await postsController.get(req as Request, res as Response);
  expect(res.json).toBeCalledWith({
    error: `No post with id number ${checkId} was found`,
  });
});

test('delete an existing post while not admin or owner -> returns 403', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    params: { id: checkId },
    userId: 1,
    isAdmin: false,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.delete(req as Request, res as Response);
  expect(res.status).toBeCalledWith(403);
});

test('delete an existing post as admin  succesfuly', async () => {
  const postsController: PostsController = new PostsController();
  const lastId: number = posts[posts.length - 1].id as number;
  const checkId: string = lastId.toString();
  const req: Partial<Request> = {
    params: { id: checkId },
    isAdmin: true,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  await postsController.delete(req as Request, res as Response);
  expect(res.status).toBeCalledWith(200);
  await postsController.get(req as Request, res as Response);
  expect(res.json).toBeCalledWith({
    error: `No post with id number ${checkId} was found`,
  });
});
