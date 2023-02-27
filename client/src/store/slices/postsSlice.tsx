import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteUser, updateUser } from "./usersSlice";
import { RootState } from "../store";
import IPost, {
  PaginatedPosts,
  PostAddInput,
  PostsGetInput,
  PostUpdateInput,
} from "../../features/posts/interfaces/IPost";
import { axiosInstance } from "../../network/api/apiClient";

const initialState = {
  posts: { hasNext: false, hasPrevious: false, result: [] } as PaginatedPosts,
  status: "idle",
  loading: false,
  post: {} as IPost,
  error: null as string | unknown,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addNewPost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.status = "idle";
        state.loading = false;
        state.posts.result.push(action.payload);
      })
      .addCase(addNewPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updatePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.result.findIndex(
          (post) => post.id === action.payload.id
        );

        state.status = "idle";
        state.loading = false;
        state.posts.result[index] = {
          ...action.payload,
        };
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const index = state.posts.result.findIndex(
          ({ id }) => id === action.payload.id
        );
        state.loading = false;
        state.status = "idle";
        state.posts.result.splice(index, 1);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPost.pending, (state, action) => {
        state.loading = true;
        state.status = "loading";
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "idle";
        state.post = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "idle";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "idle";
      });
  },
});

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id: number, { rejectWithValue }) => {
    const response = await axiosInstance
      .delete(`/posts/${id}`)
      .then((res) => res.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const uploadImage = createAsyncThunk(
  "/uploadPostImage",
  async (data: FormData) => {
    const response = await axiosInstance
      .post("images/upload", data, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((res) => res.data)
      .catch((err) => err.response.status);

    return response;
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (updatedPost: PostUpdateInput, { rejectWithValue }) => {
    const response = await axiosInstance
      .put(`/posts/${updatedPost.id}`, {
        title: updatedPost.title,
        content: updatedPost.content,
        fileName: updatedPost.fileName,
      })
      .then((res) => res.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const addNewPost = createAsyncThunk(
  "posts/addNewPost",
  async (initialPost: PostAddInput, { rejectWithValue }) => {
    const response = await axiosInstance
      .post("/posts", {
        title: initialPost.title,
        content: initialPost.content,
        fileName: initialPost.fileName,
      })
      .then((res) => res.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const fetchPost = createAsyncThunk(
  "/posts/fetchPost",
  async (id: number, { rejectWithValue }) => {
    const response = await axiosInstance
      .get(`/posts/${id}`)
      .then((res) => res.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const fetchPosts = createAsyncThunk(
  "/posts/fetchPosts",
  async (params: PostsGetInput, { rejectWithValue }) => {
    const response = await axiosInstance
      .get(
        `/posts?page=${params.page}&limit=${params.limit}&search=${params.search}`
      )
      .then((res) => res.data)
      .catch((err) => err.response.status);

    if (!isNaN(response)) {
      return rejectWithValue(response);
    }

    return response;
  }
);

export const selectAllPosts = (state: RootState) => state.posts.posts;

export const selectCurrentPost = (state: RootState) => state.posts.post;

export const selectPostById = (state: RootState, postId: number) =>
  state.posts.posts.result.find((post) => post.id === postId);

export default postsSlice.reducer;
