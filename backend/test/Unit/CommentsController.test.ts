import { Request, Response } from 'express';
import CommentsController from '../../controllers/CommentsController';
import CommentEntity from '../../models/dto/CommentEntity';
import { comments } from '../../seeds/inmemDB';
import CommentPagination from '../../services/interfaces/CommentPagination';

const { length } = comments;
let controller: CommentsController;
let mReq: Partial<Request>;
let mRes: Partial<Response>;

function addCommentsForTesting() {
  comments.push(
    new CommentEntity(
      comments[comments.length - 1].id + 1,
      1,
      0,
      'Super post!',
      1
    )
  );
  comments.push(
    new CommentEntity(
      comments[comments.length - 1].id + 1,
      2,
      0,
      'Great !!!',
      2
    )
  );
  comments.push(
    new CommentEntity(comments[comments.length - 1].id + 1, 1, 1, 'wow', 2)
  );
}

function clearAddedCommentsForTesting() {
  comments.splice(length, comments.length);
}

beforeEach(() => {
  mRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  addCommentsForTesting();
  controller = new CommentsController();
});

afterEach(() => {
  jest.resetAllMocks();
  clearAddedCommentsForTesting();
});

test('getAllShouldReturnAllComments', async () => {
  mReq = {
    body: {},
    query: {},
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: comments,
  } as CommentPagination);
});

test('getAll page 1 limit 1', async () => {
  mReq = {
    body: {},
    query: { page: '1', limit: '1' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: true,
    hasPrevious: false,
    result: [comments[0]],
  } as CommentPagination);
});

test('getAll name=super', async () => {
  mReq = {
    body: {},
    query: { name: 'super', postId: '1' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: [comments[0], comments[2]],
  } as CommentPagination);
});

test('getAll page 2 limit 1', async () => {
  mReq = {
    body: {},
    query: { page: '2', limit: '1' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: true,
    hasPrevious: true,
    result: [comments[1]],
  } as CommentPagination);
});

test('getAll page 2 limit 1', async () => {
  mReq = {
    body: {},
    query: { page: '2', limit: '1' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: true,
    hasPrevious: true,
    result: [comments[1]],
  } as CommentPagination);
});

test('getByPostIdShouldReturnCorrectWhenValid', async () => {
  mReq = {
    body: {},
    query: { postId: '1' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: comments.filter((c) => c.postId === 1),
  } as CommentPagination);
});

test('getByParentIdShouldReturnCorrectWhenValid', async () => {
  mReq = {
    body: {},
    query: { parentId: '1' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: comments.filter((c) => c.parentId === 1),
  } as CommentPagination);
});

test('get invalid post id, should return empty array', async () => {
  const invalidPostId = Math.max(...comments.map((c) => c.postId), 0) + 1;

  mReq = {
    body: {},
    query: { postId: invalidPostId.toString() },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: [],
  } as CommentPagination);
});

test('get postId id is string => 400', async () => {
  mReq = {
    body: {},
    query: { postId: 'hello' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(400);
  expect(mRes.json).toBeCalledWith({
    error: 'No valid post with the postId NaN was found',
  });
});

test('get parent id is string => 400', async () => {
  mReq = {
    body: {},
    query: { parentId: 'hello' },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(400);
  expect(mRes.json).toBeCalledWith({
    error: 'The comment with the given parentId was not found.',
  });
});

test('get invalid parent id, should return empty array', async () => {
  const invalidParentId = comments[comments.length - 1].id + 1;
  mReq = {
    body: {},
    query: { parentId: invalidParentId.toString() },
    params: {},
  };

  await controller.getAll(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith({
    hasNext: false,
    hasPrevious: false,
    result: [],
  } as CommentPagination);
});

test('add Comment Successfully => 200', async () => {
  const lastId = comments[comments.length - 1].id;
  const lastPostId = comments[comments.length - 1].postId;

  mReq = {
    userId: 2,
    body: {
      postId: lastPostId,
      parentId: lastId,
      text: 'something',
    },
    query: {},
    params: {},
  };

  await controller.add(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith(comments[comments.length - 1]);
});

test('add comment error postId must be same as parent PostId => 404', async () => {
  const lastId = comments[comments.length - 1].id;
  const lastPostId = comments[comments.length - 1].postId;

  mReq = {
    userId: 1,
    body: {
      postId: lastPostId + 1,
      parentId: lastId,
      text: 'something',
    },
    query: {},
    params: {},
  };

  await controller.add(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
  expect(mRes.json).toBeCalledWith({
    error: 'Parent comment must have same post id as new comment',
  });
});

test('add comment error wrong parentId => 404', async () => {
  const lastId = comments[comments.length - 1].id;
  mReq = {
    userId: 1,
    body: {
      postId: 2,
      parentId: lastId + 1,
      text: 'something',
    },
    query: {},
    params: {},
  };

  await controller.add(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
  expect(mRes.json).toBeCalledWith({
    error: `No valid parentId ${lastId + 1} was found`,
  });
});

test('add Comment Wrong PostId => 404', async () => {
  const invalidPostId = Math.max(...comments.map((c) => c.postId), 0) + 1;
  mReq = {
    userId: 1,
    body: {
      postId: invalidPostId,
      parentId: 2,
      text: 'something',
    },
    query: {},
    params: {},
  };

  await controller.add(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
  expect(mRes.json).toBeCalledWith({
    error: `No valid post with id number ${invalidPostId} was found`,
  });
});

test('update Comment Successful => 200', async () => {
  const lastId = comments[comments.length - 1].id;
  mReq = {
    userId: 2,
    body: {
      text: 'newText',
      author: 'newAuthor',
    },
    query: {},
    params: { id: lastId.toString() },
  };

  await controller.update(mReq as Request, mRes as Response);
  const updatedComment = await controller.commentsService.get(lastId);

  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith(updatedComment);
  expect(updatedComment.text).toBe('newText');
  expect(updatedComment.author).toBe(2);
});

test('update Comment userId is not the author => 403', async () => {
  const lastId = comments[comments.length - 1].id;
  mReq = {
    userId: 0,
    body: {
      text: 'newText',
      author: 'newAuthor',
    },
    query: {},
    params: { id: lastId.toString() },
  };

  await controller.update(mReq as Request, mRes as Response);

  expect(mRes.status).toBeCalledWith(403);
});

test('update Comment Failed => 404', async () => {
  const invalidId = comments[comments.length - 1].id + 1;
  mReq = {
    userId: 2,
    body: {
      text: 'newText',
      author: 'newAuthor',
    },
    query: {},
    params: { id: invalidId.toString() },
  };

  await controller.update(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
});

test('PUT, id is not a number', async () => {
  mReq = {
    userId: 2,
    body: {
      text: 'newText',
      author: 'newAuthor',
    },
    query: {},
    params: { id: 'a' },
  };

  await controller.update(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
});

test('getByIdSuccessful', async () => {
  const lastId = comments[comments.length - 1].id;
  mReq = {
    body: {},
    query: {},
    params: { id: lastId.toString() },
  };

  await controller.get(mReq as Request, mRes as Response);

  expect(mRes.status).toBeCalledWith(200);
  expect(mRes.json).toBeCalledWith(comments[comments.length - 1]);
});

test('invalid get, no id given', async () => {
  mReq = {
    body: {},
    query: {},
    params: {},
  };

  await controller.get(mReq as Request, mRes as Response);

  expect(mRes.status).toBeCalledWith(400);
  expect(mRes.json).toBeCalledWith({
    error: 'Id is not a number',
  });
});

test('getByIdFailed', async () => {
  const invalidId = comments[comments.length - 1].id + 1;
  mReq = {
    body: {},
    query: {},
    params: { id: invalidId.toString() },
  };

  await controller.get(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
  expect(mRes.json).toBeCalledWith({
    error: 'The comment with the given ID was not found',
  });
});

test('GET, given id is not a number', async () => {
  mReq = {
    body: {},
    query: {},
    params: { id: 'a' },
  };

  await controller.get(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(400);
  expect(mRes.json).toBeCalledWith({
    error: 'Id is not a number',
  });
});

test('delete Successful => 200', async () => {
  const commentsLength = comments.length;
  const lastId = comments[commentsLength - 1].id;
  mReq = {
    userId: 2,
    body: {},
    query: {},
    params: { id: lastId.toString() },
  };

  await controller.delete(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(200);
});

test('delete Failed, comment id is invalid => 404', async () => {
  const invalidId = comments[comments.length - 1].id + 1;
  mReq = {
    userId: 2,
    body: {},
    query: {},
    params: { id: invalidId.toString() },
  };

  await controller.delete(mReq as Request, mRes as Response);
  expect(mRes.status).toBeCalledWith(404);
});
