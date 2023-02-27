import {
  configureStore,
  combineReducers,
  ThunkDispatch,
  Action,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import postsReducer from "./slices/postsSlice";
import userReducer from "./slices/usersSlice";
import commentsReducer from "./slices/commentsSlice";
import authReducer from "./slices/authSlice";

const reducer = combineReducers({
  posts: postsReducer,
  users: userReducer,
  comments: commentsReducer,
  auth: authReducer,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type ThunkAppDispatch = ThunkDispatch<RootState, void, Action>;
export type AppDispatch = typeof store.dispatch;
export const useAppThunkDispatch = () => useDispatch<ThunkAppDispatch>();
