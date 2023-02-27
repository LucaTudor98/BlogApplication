import IPaginatedUsers, {
  IUser,
  IUserAddImg,
} from "../../features/users/iUserTypes";
import {
  IUserAdd,
  IUserUpdate,
  IUserGetAll,
} from "../../features/users/iUserTypes";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../network/api/apiClient";

export const getUser = createAsyncThunk(
  "users/getUser",
  async (id: number, { rejectWithValue }) => {
    const response = await axiosInstance
      .get(`/users/${id}`)
      .then((response) => response.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (params: IUserGetAll, { rejectWithValue }) => {
    const response = await axiosInstance
      .get(
        `/users?page=${params.page}&limit=${params.limit}&name=${params.name}`
      )
      .then((response) => response.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (user: IUserAdd, { rejectWithValue }) => {
    const response = await axiosInstance
      .post(`/users`, {
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
      })
      .then((response) => response.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const addUserImg = createAsyncThunk(
  "users/addUserAvatar",
  async (user: IUserAddImg) => {
    return (
      await axiosInstance.put(`/users/upload/${user.id}`, user.avatar, {
        headers: { "content-type": "multipart/form-data" },
      })
    ).data;
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (user: IUserUpdate, { rejectWithValue }) => {
    const response = await axiosInstance
      .put(`/users/${user.id}`, user)
      .then((response) => response.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number, { rejectWithValue }) => {
    const response = await axiosInstance
      .delete(`/users/${id}`)
      .then((response) => response.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const userSlice = createSlice({
  name: "users",
  initialState: {
    users: {
      hasNext: false,
      hasPrevious: false,
      result: [],
    } as IPaginatedUsers,
    user: {} as IUser,
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addUser.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users.result = [action.payload];
      })
      .addCase(addUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addUserImg.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(addUserImg.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users.result = [action.payload];
      })
      .addCase(addUserImg.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.users.result.findIndex(
          (user) => user.id === action.payload.id
        );
        state.users.result[index] = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.users.result.findIndex(
          (user) => user.id === action.payload.id
        );

        state.users.result.splice(index, 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
