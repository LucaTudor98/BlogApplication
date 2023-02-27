import {
  fetchPosts,
  fetchPost,
  addNewPost,
  updatePost,
  deletePost,
} from "../../../store/slices/postsSlice";
import { configureStore } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../network/api/apiClient";
import postReducer from "../../../store/slices/postsSlice";
import MockAdapter from "axios-mock-adapter";
import IPost, {
  PostAddInput,
  PostsGetInput,
  PostUpdateInput,
} from "../../../features/posts/interfaces/IPost";

const mock = new MockAdapter(axiosInstance);
let store: any;
const getListResponse = [
  {
    id: 1,
    title: "random",
    content: "randomContent",
    authorName: "admin",
    numberOfComments: 4,
  },
  {
    id: 2,
    title: "second post",
    content: "second random content",
    authorName: "admin2",
    numberOfComments: 3,
  },
];

beforeEach(() => {
  store = configureStore({
    reducer: { posts: postReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
});

afterEach(() => {
  mock.reset();
});

const fetchPostMock = (id: number, statusCode: number) => {
  mock.onGet(`/posts/${id}`, { id }).reply(statusCode, {
    id: getListResponse[id].id,
    title: getListResponse[id].title,
    content: getListResponse[id].content,
    authorName: getListResponse[id].authorName,
    numberOfComments: getListResponse[id].numberOfComments,
  });
};

const fetchPostsMock = (params: PostsGetInput, statusCode: number) => {
  mock
    .onGet(
      `/posts?page=${params.page}&limit=${params.limit}&search=${params.search}`
    )
    .reply(statusCode, {
      hasNext: false,
      hasPrevious: false,
      result: getListResponse,
    });
};

const addPostMock = (postToAdd: PostAddInput, statusCode: number) => {
  mock.onPost("/posts").reply(statusCode, {
    id: getListResponse.length + 1,
    title: postToAdd.title,
    content: postToAdd.content,
    authorName: "loggedInUser",
  });
};

const updatePostMock = (postToUpdate: PostUpdateInput, statusCode: number) => {
  mock.onPut(`/posts/${postToUpdate.id}`).reply(statusCode, {
    id: postToUpdate.id,
    title: postToUpdate.title,
    content: postToUpdate.content,
    authorName: getListResponse[postToUpdate.id - 1].authorName,
    numberOfComments: getListResponse[postToUpdate.id - 1].numberOfComments,
  });
};

const deletePostMock = (id: number, statusCode: number) => {
  mock.onDelete(`/posts/${id}`).reply(statusCode, {
    id: getListResponse[id].id,
    title: getListResponse[id].title,
    content: getListResponse[id].content,
    authorName: getListResponse[id].authorName,
    numberOfComments: getListResponse[id].numberOfComments,
  });
};

test("it should be able to fetch post successful", async () => {
  const id = 1;
  fetchPostMock(id, 200);
  const response = await store.dispatch(fetchPost(id));
  const post = response.payload;

  expect(response.type).toBe("/posts/fetchPost/fulfilled");
  expect(post).toEqual(getListResponse[id]);

  const state = store.getState().posts;

  expect(state.status).toEqual("idle");
  expect(state.post).toEqual(post);
});

test("server returns error error code failed", async () => {
  const id = 1;
  const notFoundError = 404;
  fetchPostMock(id, notFoundError);
  const response = await store.dispatch(fetchPost(id));

  expect(response.type).toBe("/posts/fetchPost/rejected");
  expect(response.payload).toEqual(notFoundError);

  const state = store.getState().posts;

  expect(state.status).toEqual("failed");
  expect(state.error).toEqual(notFoundError);
});

test("fetchPosts successfully", async () => {
  const params: PostsGetInput = { page: 1, limit: 8, search: "" };
  fetchPostsMock(params, 200);
  const response = await store.dispatch(fetchPosts(params));

  expect(response.type).toBe("/posts/fetchPosts/fulfilled");
  expect(response.payload).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: getListResponse,
  });

  const state = store.getState().posts;

  expect(state.status).toEqual("succeeded");
  expect(state.posts).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: getListResponse,
  });
});

test("fetchPosts failed server error", async () => {
  const params: PostsGetInput = { page: 1, limit: 8, search: "" };
  const badRequestError = 400;

  fetchPostsMock(params, badRequestError);
  const response = await store.dispatch(fetchPosts(params));

  expect(response.type).toBe("/posts/fetchPosts/rejected");
  expect(response.payload).toEqual(badRequestError);

  const state = store.getState().posts;

  expect(state.status).toEqual("failed");
  expect(state.error).toEqual(badRequestError);
});

test("add post successfuly", async () => {
  const postToAdd: PostAddInput = {
    title: "new title",
    content: "new content",
  };

  addPostMock(postToAdd, 200);
  const response = await store.dispatch(addNewPost(postToAdd));

  expect(response.type).toBe("posts/addNewPost/fulfilled");
  expect(response.payload).toStrictEqual({
    id: getListResponse.length + 1,
    title: postToAdd.title,
    content: postToAdd.content,
    authorName: "loggedInUser",
  });

  const state = store.getState().posts;
  expect(state.status).toEqual("idle");
  expect(state.posts.result).toStrictEqual([
    {
      id: getListResponse.length + 1,
      title: postToAdd.title,
      content: postToAdd.content,
      authorName: "loggedInUser",
    },
  ]);
});

test("add post failed", async () => {
  const postToAdd: PostAddInput = {
    title: "new title",
    content: "new content",
  };
  const unauthorizedError = 401;

  addPostMock(postToAdd, unauthorizedError);
  const response = await store.dispatch(addNewPost(postToAdd));
  expect(response.type).toBe("posts/addNewPost/rejected");
  expect(response.payload).toBe(unauthorizedError);

  const state = store.getState().posts;
  expect(state.status).toEqual("failed");
  expect(state.error).toBe(unauthorizedError);
});

test("update post successfully", async () => {
  const id = 1;
  const postToUpdate: PostUpdateInput = {
    id: id,
    title: "updated title",
    content: "updated content",
  };
  const params: PostsGetInput = { page: 1, limit: 8, search: "" };

  fetchPostsMock(params, 200);
  updatePostMock(postToUpdate, 200);

  await store.dispatch(fetchPosts(params));
  const response = await store.dispatch(updatePost(postToUpdate));

  expect(response.type).toBe("posts/updatePost/fulfilled");
  expect(response.payload).toStrictEqual({
    id: postToUpdate.id,
    title: postToUpdate.title,
    content: postToUpdate.content,
    authorName: getListResponse[id - 1].authorName,
    numberOfComments: getListResponse[id - 1].numberOfComments,
  });

  const state = store.getState().posts;
  expect(state.status).toEqual("idle");
  expect(state.posts.result).toEqual([
    {
      id: postToUpdate.id,
      title: postToUpdate.title,
      content: postToUpdate.content,
      authorName: getListResponse[id - 1].authorName,
      numberOfComments: getListResponse[id - 1].numberOfComments,
    },
    getListResponse[1],
  ]);
});

test("update post failed", async () => {
  const id = 1;
  const postToUpdate: PostUpdateInput = {
    id: id,
    title: "updated title",
    content: "updated content",
  };
  const error = 404;

  updatePostMock(postToUpdate, error);

  const response = await store.dispatch(updatePost(postToUpdate));

  expect(response.type).toBe("posts/updatePost/rejected");
  expect(response.payload).toStrictEqual(error);

  const state = store.getState().posts;
  expect(state.status).toEqual("failed");
  expect(state.error).toBe(error);
});

test("delete post successfully", async () => {
  const id = 1;
  const params: PostsGetInput = { page: 1, limit: 8, search: "" };

  fetchPostsMock(params, 200);
  deletePostMock(id, 200);
  await store.dispatch(fetchPosts(params));
  const response = await store.dispatch(deletePost(id));

  expect(response.type).toBe("posts/deletePost/fulfilled");
  expect(response.payload).toStrictEqual(getListResponse[id]);

  const state = store.getState().posts;
  expect(state.status).toBe("idle");
  expect(state.posts.result).toStrictEqual([getListResponse[0]]);
});

test("delete post failed", async () => {
  const id = 1;
  const error = 403;

  deletePostMock(id, error);
  const response = await store.dispatch(deletePost(id));

  expect(response.type).toBe("posts/deletePost/rejected");
  expect(response.payload).toBe(error);

  const state = store.getState().posts;
  expect(state.status).toBe("failed");
  expect(state.error).toBe(error);
});
