import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setToken, removeToken } from "../../utils/HelperFunctions";
import {
  authorizeAxiosInstance,
  axiosInstance,
  deleteAxiosHeader,
} from "../../network/api/apiClient";
import { deleteUser, updateUser, addUserImg } from "./usersSlice";

type userData = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  password: string;
  dateCreated: Date;
  dateModified: Date;
  imgPath?: string;
};

type userLogin = {
  username: string;
  password: string;
  grant_type: string;
};

const initialState = {
  isUserLoggedIn: false,
  userData: {} as userData,
  loading: false,
  token: null as string | null,
  error: null as number | null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchToken.fulfilled, (state, action) => {
        const { access_token } = action.payload;
        state.token = access_token;
        state.loading = false;
      })
      .addCase(fetchToken.rejected, (state, action) => {
        state.isUserLoggedIn = false;
        state.token = null;
        state.loading = false;
        state.error = action.payload as number;
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        state.isUserLoggedIn = true;
        state.userData = user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isUserLoggedIn = false;
        removeToken();
      })
      .addCase(signOut.fulfilled, (state, action) => {
        state.loading = false;
        state.isUserLoggedIn = false;
        state.userData = {} as userData;
        state.token = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        if (action.payload.id === state.userData.id) {
          state.isUserLoggedIn = false;
          state.userData = {} as userData;
          state.token = null;
          removeToken();
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload.id === state.userData.id) {
          state.userData.name = action.payload.name;
          state.userData.imgPath = action.payload.imgPath;
        }
      })
      .addCase(addUserImg.fulfilled, (state, action) => {
        if (action.payload.id === state.userData.id) {
          state.userData.imgPath = action.payload.imgPath;
        }
      })
      .addCase(fetchInitialState.pending, (state) => {
        state.isUserLoggedIn = true;
      })
      .addCase(fetchInitialState.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  },
});

export const fetchInitialState = createAsyncThunk(
  "/auth/initialize",
  async (accessToken: string) => {
    return accessToken;
  }
);

export const fetchToken = createAsyncThunk(
  "/auth/token",
  async (payload: userLogin, { rejectWithValue }) => {
    const decoded =
      process.env.REACT_APP_CLIENT_ID +
      ":" +
      process.env.REACT_APP_CLIENT_SECRET;

    const params = new URLSearchParams();
    params.append("grant_type", payload.grant_type);
    params.append("username", payload.username);
    params.append("password", payload.password);
    const response = await axiosInstance
      .post("/auth/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(decoded, "binary").toString("base64"),
        },
      })
      .then((res) => res.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    setToken(response.access_token);
    authorizeAxiosInstance(response.access_token);

    return response;
  }
);

export const login = createAsyncThunk(
  "/auth/login",
  async (accessToken: string) => {
    if (!accessToken) {
      Promise.reject();
      return;
    }

    const response = await axiosInstance.get("/auth/login", {});
    const user = await axiosInstance.get(`/users/${response.data.user.id}`);
    return user.data;
  }
);

export const signOut = createAsyncThunk("/auth/signOut", async () => {
  deleteAxiosHeader();
  removeToken();
});

export default authSlice.reducer;
