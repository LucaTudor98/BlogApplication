import {
  addUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../../../store/slices/usersSlice";
import {
  IUserAdd,
  IUserGetAll,
  IUserUpdate,
} from "../../../features/users/iUserTypes";
import { configureStore } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../network/api/apiClient";
import userReducer from "../../../store/slices/usersSlice";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axiosInstance);
let store: any;
const getListResponse = [
  {
    id: 1,
    name: "random",
    email: "random@gmail.com",
    password: "",
    isAdmin: true,
  },
  {
    id: 2,
    name: "random2",
    email: "random2@gmail.com",
    password: "",
    isAdmin: true,
  },
];

const updateUserMock = (user: IUserUpdate, statusCode: number) => {
  mock.onPut(`/users/${user.id}`).reply(statusCode, {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    isAdmin: user.isAdmin,
  });
};

const addUserMock = (user: IUserAdd, statusCode: number) => {
  mock.onPost("/users").reply(statusCode, {
    id: getListResponse.length + 1,
    name: user.name,
    email: user.email,
    password: user.password,
    isAdmin: user.isAdmin,
  });
};

const getUsersMock = (statusCode: number, params: IUserGetAll) => {
  mock
    .onGet(
      `/users?page=${params.page}&limit=${params.limit}&name=${params.name}`
    )
    .reply(statusCode, {
      hasNext: false,
      hasPrevious: false,
      result: getListResponse,
    });
};

const getUserMock = (id: number, statusCode: number) => {
  mock.onGet(`/users/${id}`, { id }).reply(statusCode, {
    id: getListResponse[id].id,
    name: getListResponse[id].name,
    email: getListResponse[id].email,
    password: getListResponse[id].password,
    isAdmin: getListResponse[id].isAdmin,
  });
};

const deleteUserMock = (id: number, statusCode: number) => {
  mock.onDelete(`/users/${id}`, { id }).reply(statusCode, {
    id: getListResponse[id].id,
    name: getListResponse[id].name,
    email: getListResponse[id].email,
    password: getListResponse[id].password,
    isAdmin: getListResponse[id].isAdmin,
  });
};

beforeEach(() => {
  store = configureStore({
    reducer: { users: userReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
});

afterEach(() => {
  mock.reset();
});

test("it should be able to fetch user successful", async () => {
  const id = 1;
  getUserMock(id, 200);
  const response = await store.dispatch(getUser(id));
  const user = response.payload;

  expect(response.type).toBe("users/getUser/fulfilled");
  expect(user).toEqual(getListResponse[id]);

  const state = store.getState().users;

  expect(state.user).toEqual(user);
  expect(state.status).toEqual("succeeded");
});

test("fetching server returns error", async () => {
  const id = 1;
  const notFoundStatusCode = 404;

  getUserMock(id, notFoundStatusCode);

  const response = await store.dispatch(getUser(id));

  expect(response.type).toBe("users/getUser/rejected");
  expect(response.payload).toEqual(notFoundStatusCode);

  const state = store.getState().users;

  expect(state.status).toEqual("failed");
});

test("fetching users successful", async () => {
  const params: IUserGetAll = { page: 1, limit: 8, name: "" };
  getUsersMock(200, params);

  const response = await store.dispatch(getUsers(params));

  expect(response.type).toBe("users/getUsers/fulfilled");
  expect(response.payload).toEqual({
    hasNext: false,
    hasPrevious: false,
    result: getListResponse,
  });

  const state = store.getState().users;

  expect(state.users).toEqual(response.payload);
  expect(state.status).toEqual("succeeded");
});

test("fetching users error", async () => {
  const badRequestStatusCode = 400;
  const params: IUserGetAll = { page: 1, limit: 8, name: "" };
  getUsersMock(badRequestStatusCode, params);

  const response = await store.dispatch(getUsers(params));

  expect(response.payload).toEqual(badRequestStatusCode);

  const state = store.getState().users;

  expect(state.error).toBe(badRequestStatusCode);
  expect(state.status).toEqual("failed");
});

test("add test successful", async () => {
  const userToAdd: IUserAdd = {
    name: "addNewUser",
    email: "addNewUser@gmail.com",
    password: "",
    isAdmin: false,
  };
  addUserMock(userToAdd, 200);
  const response = await store.dispatch(addUser(userToAdd));

  expect(response.type).toBe("users/addUser/fulfilled");

  expect(response.payload).toEqual({
    id: getListResponse.length + 1,
    name: userToAdd.name,
    email: userToAdd.email,
    password: userToAdd.password,
    isAdmin: userToAdd.isAdmin,
  });

  const state = store.getState().users;

  expect(state.users.result).toEqual([response.payload]);

  expect(state.status).toEqual("succeeded");
});

test("add test fails", async () => {
  const serverErrorStatus = 500;
  const userToAdd: IUserAdd = {
    name: "addNewUser",
    email: "addNewUser@gmail.com",
    password: "",
    isAdmin: false,
  };
  addUserMock(userToAdd, serverErrorStatus);
  const response = await store.dispatch(addUser(userToAdd));

  expect(response.type).toBe("users/addUser/rejected");

  expect(response.payload).toEqual(serverErrorStatus);

  const state = store.getState().users;

  expect(state.error).toBe(serverErrorStatus);
  expect(state.status).toEqual("failed");
});

test("update test successful", async () => {
  const params: IUserGetAll = { page: 1, limit: 8, name: "" };
  const userToUpdate: IUserUpdate = {
    id: 2,
    name: "newName",
    email: "newEmail@gmail.com",
    password: "",
    isAdmin: false,
  };

  updateUserMock(userToUpdate, 200);
  getUsersMock(200, params);
  await store.dispatch(getUsers(params));

  const response = await store.dispatch(updateUser(userToUpdate));
  expect(response.type).toBe("users/updateUser/fulfilled");
  expect(response.payload).toEqual(userToUpdate);

  const state = store.getState().users;

  expect(state.users.result).toEqual([getListResponse[0], userToUpdate]);
  expect(state.status).toEqual("succeeded");
});

test("update test fail", async () => {
  const params: IUserGetAll = { page: 1, limit: 8, name: "" };
  const errorStatusCode = 403;
  const userToUpdate: IUserUpdate = {
    id: 2,
    name: "newName",
    email: "newEmail@gmail.com",
    password: "",
    isAdmin: false,
  };

  updateUserMock(userToUpdate, errorStatusCode);
  getUsersMock(errorStatusCode, params);

  await store.dispatch(getUsers(params));

  const response = await store.dispatch(updateUser(userToUpdate));
  expect(response.type).toBe("users/updateUser/rejected");
  expect(response.payload).toEqual(errorStatusCode);

  const state = store.getState().users;

  expect(state.status).toEqual("failed");
  expect(state.error).toBe(errorStatusCode);
});

test("delete test successful", async () => {
  const params: IUserGetAll = { page: 1, limit: 8, name: "" };
  const id = 1;

  getUsersMock(200, params);
  deleteUserMock(id, 200);
  await store.dispatch(getUsers(params));

  const response = await store.dispatch(deleteUser(id));
  expect(response.type).toBe("users/deleteUser/fulfilled");
  expect(response.payload).toEqual(getListResponse[id]);

  const state = store.getState().users;

  expect(state.users.result).toEqual([getListResponse[0]]);
  expect(state.status).toEqual("succeeded");
});

test("delete test fail", async () => {
  const params: IUserGetAll = { page: 1, limit: 8, name: "" };
  const id = 1;
  const unauthorizedCode = 403;
  getUsersMock(200, params);
  deleteUserMock(id, unauthorizedCode);
  await store.dispatch(getUsers(params));

  const response = await store.dispatch(deleteUser(id));
  expect(response.type).toBe("users/deleteUser/rejected");
  expect(response.payload).toEqual(unauthorizedCode);

  const state = store.getState().users;

  expect(state.users.result).toEqual(getListResponse);
  expect(state.error).toBe(unauthorizedCode);
});
