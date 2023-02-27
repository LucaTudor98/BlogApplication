import React from "react";
import { render, screen } from "../../../utils/test-utils";
import { AddPostPage } from "../../../features/posts/addPostForm";
import userEvent from "@testing-library/user-event";

test("renders the addPost Page", async () => {
  render(<AddPostPage isLoggedIn={true} />);

  const container = screen.getByTestId("container");
  expect(container).toBeInTheDocument();
});

test("submit button is disabled when content is missing", async () => {
  render(<AddPostPage isLoggedIn={true} />);

  const titleInput = screen.getByTestId("title-input");
  const saveButton = screen.getByTestId("save");

  userEvent.type(titleInput, "Random Post");

  expect(saveButton).toBeDisabled();
});

test("submit button is disabled when title is missing", async () => {
  render(<AddPostPage isLoggedIn={true} />);

  const contentInput = screen.getByTestId("content-input");
  const saveButton = screen.getByTestId("save");

  userEvent.type(contentInput, "Random Post Content -------");

  expect(saveButton).toBeDisabled();
});

test("submit button is enabled when there is title and content", async () => {
  render(<AddPostPage isLoggedIn={true} />);

  const contentInput = screen.getByTestId("content-input");

  const titleInput = screen.getByTestId("title-input");
  const saveButton = screen.getByTestId("save");

  userEvent.type(titleInput, "Random Post");
  userEvent.type(contentInput, "Random Post Content -------");

  expect(saveButton).toBeEnabled();
});
