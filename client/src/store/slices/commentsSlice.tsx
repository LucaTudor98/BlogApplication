import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../network/api/apiClient";
import {
  ICommentAdd,
  ICommentDelete,
  ICommentUpdate,
  ICommentPostAndName,
  ICommentPostAndParent,
  IPaginatedComments,
  ICommentGetAll,
} from "../../features/comments/iCommentTypes";

export const getCommentsFromPost = createAsyncThunk(
  "comments/getCommentsFromPost",
  async (props: ICommentPostAndName) => {
    return (
      await axiosInstance.get(
        `/comments?postId=${props.postId}&name=${props.name}&limit=${props.limit}&page=${props.page}`
      )
    ).data;
  }
);

export const getTopCommentsFromPost = createAsyncThunk(
  "comments/getCommentsFromPost",
  async (props: ICommentGetAll) => {
    return (
      await axiosInstance.get(
        `/comments?postId=${props.postId}&parentId=%00&page=${props.page}&limit=${props.limit}`
      )
    ).data;
  }
);

export const getRepliesFromComment = createAsyncThunk(
  "comments/getRepliesFromComment",
  async (comment: ICommentPostAndParent) => {
    return (
      await axiosInstance.get(
        `/comments?postId=${comment.postId}&parentId=${comment.parentId}&page=${comment.page}&limit=${comment.limit}`
      )
    ).data;
  }
);

export const addComment = createAsyncThunk(
  "comments/addComment",
  async (comment: ICommentAdd) => {
    return {
      ...(
        await axiosInstance.post(`/comments`, {
          postId: comment.postId,
          parentId: comment.parentId,
          text: comment.text,
          authorName: comment.authorName,
        })
      ).data,
      authorName: comment.authorName,
      authorAvatarPath: comment.authorAvatarPath,
      replyCount: comment.replyCount,
    };
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async (comment: ICommentUpdate) => {
    return (await axiosInstance.put(`/comments/${comment.id}`, comment)).data;
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (comment: ICommentDelete) => {
    await axiosInstance.delete(`/comments/${comment.id}`);

    return { ...comment };
  }
);

export const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    comments: {
      hasNext: false,
      hasPrevious: false,
      result: [],
    } as IPaginatedComments,
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTopCommentsFromPost.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTopCommentsFromPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comments = action.payload;
      })
      .addCase(getTopCommentsFromPost.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getRepliesFromComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRepliesFromComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload.result.length > 0) {
          const index = state.comments.result.findIndex(
            (comment) => comment.id === action.payload.result[0].parentId
          );

          state.comments.result[index] = {
            ...state.comments.result[index],
            replies: action.payload.result,
          };
        }
      })
      .addCase(getRepliesFromComment.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.status = "succeeded";

        if (action.payload.parentId === null) {
          state.comments.result = [
            { ...action.payload, replyCount: "0" },
            ...state.comments.result,
          ];

          return;
        }

        const index = state.comments.result.findIndex(
          (comment) => comment.id === action.payload.parentId
        );

        if (index !== -1) {
          state.comments.result[index].replyCount = (
            parseInt(state.comments.result[index]!.replyCount!) + 1
          ).toString();

          state.comments.result[index].replies = [
            action.payload,
            ...(state.comments.result[index].replies ?? []),
          ];
        }
      })
      .addCase(addComment.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.status = "succeeded";

        const index = state.comments.result.findIndex(
          (comment) => comment.id === action.payload.id
        );

        if (index !== -1) {
          state.comments.result[index] = {
            ...state.comments.result[index],
            ...action.payload,
          };

          return;
        }

        const commentIndex = state.comments.result.findIndex(
          (comment) => comment.id === action.payload.parentId
        );

        if (commentIndex !== -1) {
          const replyIndex = state.comments.result[
            commentIndex
          ].replies?.findIndex((reply) => reply.id === action.payload.id);

          if (replyIndex !== -1) {
            state.comments.result[commentIndex].replies![replyIndex!] = {
              ...state.comments.result[commentIndex].replies![replyIndex!],
              text: action.payload.text,
            };
          }
        }
      })
      .addCase(updateComment.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = "succeeded";

        const index = state.comments.result.findIndex(
          (comment) => comment.id === action.payload.id
        );

        if (index !== -1) {
          state.comments.result.splice(index, 1);

          return;
        }

        const commentIndex = state.comments.result.findIndex(
          (comment) => comment.id === action.payload.parentId
        );

        if (commentIndex !== -1) {
          const replyIndex = state.comments.result[
            commentIndex
          ].replies?.findIndex((reply) => reply.id === action.payload.id);

          if (replyIndex !== -1) {
            state.comments.result[commentIndex].replyCount = (
              parseInt(state.comments.result[commentIndex]!.replyCount!) - 1
            ).toString();

            state.comments.result[commentIndex].replies!.splice(replyIndex!, 1);
          }
        }
      })
      .addCase(deleteComment.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default commentsSlice.reducer;
