import { cleanup } from "@testing-library/react";
import { store } from "../../../store/store";
import IComment, {
  ICommentAdd,
  ICommentUpdate,
} from "../../../features/comments/iCommentTypes";
import MockAdapter from "axios-mock-adapter";
import {
  addComment,
  deleteComment,
  getRepliesFromComment,
  getTopCommentsFromPost,
  updateComment,
} from "../../../store/slices/commentsSlice";
import { axiosInstance } from "../../../network/api/apiClient";

const originalComments = [
  {
    id: 0,
    postId: 26,
    parentId: null,
    text: "Comment",
    author: 1,
    dateCreated: "2022-06-08T20:31:10.320Z",
    dateModified: "2022-06-08T20:31:10.320Z",
    authorName: "Constant",
    authorAvatarPath: "",
    replyCount: "1",
  },
  {
    id: 1,
    postId: 26,
    parentId: null,
    text: "Parent Comment",
    author: 1,
    dateCreated: "2022-06-08T20:31:10.320Z",
    dateModified: "2022-06-08T20:31:10.320Z",
    authorName: "Constant",
    authorAvatarPath: "",
    replyCount: "1",
  },
  {
    id: 2,
    postId: 26,
    parentId: 0,
    text: "ty",
    author: 255,
    dateCreated: "2022-06-08T20:31:10.320Z",
    dateModified: "2022-06-08T20:31:10.320Z",
    authorName: "oo",
    authorAvatarPath: "1654451304538-42520467.png",
    replyCount: "0",
  },
  {
    id: 3,
    postId: 1,
    parentId: null,
    text: "as",
    author: 1,
    dateCreated: "2022-06-08T20:31:10.320Z",
    dateModified: "2022-06-08T20:31:10.320Z",
    authorName: "Constant",
    authorAvatarPath: "",
    replyCount: "1",
  },
  {
    id: 4,
    postId: 1,
    parentId: 3,
    text: "ee",
    author: 1,
    dateCreated: "2022-06-08T20:31:10.320Z",
    dateModified: "2022-06-08T20:31:10.320Z",
    authorName: "Constant",
    authorAvatarPath: "",
    replyCount: "0",
  },
];

const getCommentsByNameFromPostMock = (
  postId: number,
  name: string,
  limit: number,
  page: number
) => {
  mock
    .onGet(
      `/comments?postId=${postId}&name=${name}&limit=${limit}&page=${page}`
    )
    .reply(200, {
      hasNext: false,
      hasPrevious: false,
      result: comments.filter((comment) => comment.postId === postId),
    });
};

const getTopCommentsFromPostMock = (
  postId: number,
  page: number,
  limit: number
) => {
  mock
    .onGet(
      `/comments?postId=${postId}&parentId=%00&page=${page}&limit=${limit}`
    )
    .reply(200, {
      hasNext: false,
      hasPrevious: false,
      result: comments.filter(
        (comment) => comment.postId === postId && comment.parentId === null
      ),
    });
};

const getRepliesFromCommentMock = (
  postId: number,
  parentId: number,
  page: number,
  limit: number
) => {
  mock
    .onGet(
      `/comments?postId=${postId}&parentId=${parentId}&page=${page}&limit=${limit}`
    )
    .reply(200, {
      hasNext: false,
      hasPrevious: false,
      result: comments.filter(
        (comment) => comment.postId === postId && comment.parentId === parentId
      ),
    });
};

const addCommentMock = (comment: ICommentAdd) => {
  mock.onPost("/comments").reply(200, {
    id: comments.length,
    ...comment,
  });
};

const updateCommentMock = (id: number, comment: ICommentUpdate) => {
  mock.onPut(`/comments/${id}`).reply(200, {
    id: id,
    text: comment.text,
    author: comments[id].author,
    postId: comments[id].postId,
    parentId: comments[id].parentId,
  } as IComment);
};

const deletedCommentMock = (id: number) => {
  mock.onDelete(`/comments/${id}`).reply(200, comments.splice(id, 1));
};

let comments = [...originalComments];
let mock: MockAdapter;

beforeAll(() => {
  comments = [...originalComments];

  mock = new MockAdapter(axiosInstance);
});

afterEach(() => {
  comments = [...originalComments];
  mock.reset();
  cleanup();
});

test("Get initial comments from reducer", () => {
  const state = store.getState().comments;
  expect(state.comments).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: [],
  });
});

test("mock a valid get response for post id 26, and parent id null", async () => {
  const req = { postId: 26, page: 1, limit: 5, search: "" };

  getTopCommentsFromPostMock(req.postId, req.page, req.limit);

  const result = await store.dispatch(getTopCommentsFromPost(req));

  expect(result.type).toBe("comments/getCommentsFromPost/fulfilled");

  expect(result.payload).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: [originalComments[0], originalComments[1]],
  });
});

test("mock a valid get response for post id 26, and parent id 0", async () => {
  const req = { postId: 26, parentId: 0, page: 1, limit: 5 };

  getRepliesFromCommentMock(req.postId, req.parentId, req.page, req.limit);

  const result = await store.dispatch(
    getRepliesFromComment({ postId: 26, parentId: 0, page: 1, limit: 5 })
  );

  expect(result.type).toBe("comments/getRepliesFromComment/fulfilled");

  expect(result.payload).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: [originalComments[2]],
  });
});

test("mock a invalid get response for post id 26, and parent id 80", async () => {
  const req = { postId: 26, parentId: 80, page: 1, limit: 5 };

  getRepliesFromCommentMock(req.postId, req.parentId, req.page, req.limit);

  const result = await store.dispatch(getRepliesFromComment(req));

  expect(result.payload).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: [],
  });
});

test("mock a invalid get response for post id 80, and parent id null, page 2 does not exist", async () => {
  const req = { postId: 80, page: 2, limit: 5, search: "" };

  mock
    .onGet(
      `/comments?postId=${req.postId}&parentId=%00&page=${req.page}&limit=${req.limit}`
    )
    .reply(404, { message: "Comment does not exist" });

  const result = await store.dispatch(getTopCommentsFromPost(req));

  expect(result.type).toBe("comments/getCommentsFromPost/rejected");
});

test("mock a valid post", async () => {
  const req = { postId: 26, parentId: null, text: "Comment" };

  addCommentMock(req);

  const result = await store.dispatch(addComment(req));

  expect(result.type).toBe("comments/addComment/fulfilled");

  expect(result.payload.id).toBe(5);
  expect(result.payload.postId).toBe(26);
  expect(result.payload.parentId).toBe(null);
  expect(result.payload.text).toBe("Comment");
});

test("mock valid put", async () => {
  const req = { id: 0, text: "new comment", postId: 0, parentId: 0 };

  updateCommentMock(req.id, req);

  const result = await store.dispatch(updateComment(req));

  expect(result.type).toBe("comments/updateComment/fulfilled");

  expect(result.payload.id).toBe(0);
  expect(result.payload.postId).toBe(26);
  expect(result.payload.parentId).toBe(null);
  expect(result.payload.text).toBe("new comment");
});

test("mock valid delete", async () => {
  deletedCommentMock(1);

  const result = await store.dispatch(deleteComment({ id: 1, parentId: null }));

  expect(result.type).toBe("comments/deleteComment/fulfilled");

  expect(comments[1].id).toBe(2);
  expect(comments[1].postId).toBe(26);
  expect(comments[1].parentId).toBe(0);
  expect(comments[1].text).toBe("ty");
});
