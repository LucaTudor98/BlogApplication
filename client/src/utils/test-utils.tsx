import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions } from "@testing-library/react";
import React from "react";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import userReducer from "../store/slices/usersSlice";
import postsReducer from "../store/slices/postsSlice";
import commentsReducer from "../store/slices/commentsSlice";
import authReducer from "../store/slices/authSlice";

const reducer = combineReducers({
  posts: postsReducer,
  users: userReducer,
  comments: commentsReducer,
  auth: authReducer,
});

const reduxRender = (
  ui: ReactElement,
  {
    preloadedState,
    store = configureStore({
      reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    }),
    ...renderOptions
  }: any = {}
) => {
  const Wrapper = ({ children }: any) => {
    return (
      <Provider store={store}>
        <Router>{children} </Router>
      </Provider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";
export { reduxRender as render };
