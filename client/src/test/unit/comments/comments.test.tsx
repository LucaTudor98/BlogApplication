import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../store/store";
import Comment from "../../../features/comments/commentListComponents/comment";
import AddComment from "../../../features/comments/commentListComponents/commentComponents/addComment";
import IComment from "../../../features/comments/iCommentTypes";

const commentProp = {
  id: 1,
  author: 1,
  authorName: "John",
  postId: 1,
  parentId: null,
  dateCreated: "2022-06-08T20:31:10.320Z",
  dateModified: "2022-06-08T20:31:10.320Z",
  text: "Hello",
  replies: null,
  replyCount: null,
  authorAvatarPath: undefined,
} as unknown as IComment;

afterEach(() => {
  cleanup();
});

test("should render comment element", () => {
  render(
    <Provider store={store}>
      <Comment {...commentProp} />
    </Provider>
  );
  const commentElement = screen.getByTestId("comment");
  expect(commentElement).toBeInTheDocument();
});

test("comment should have text", () => {
  render(
    <Provider store={store}>
      <Comment {...commentProp} />
    </Provider>
  );
  const commentElement = screen.getByTestId("comment");
  expect(commentElement).toHaveTextContent("Hello");
});

test("comment should have HTML element", () => {
  render(
    <Provider store={store}>
      <Comment {...commentProp} />
    </Provider>
  );
  const commentElement = screen.getByTestId("comment");
  expect(commentElement).toContainHTML("<RepliesList");
});

test("should render AddComment element", () => {
  render(
    <Provider store={store}>
      <AddComment postId={1} />
    </Provider>
  );
  const addCommentElement = screen.getByTestId("addComment");
  expect(addCommentElement).toBeInTheDocument();
});

test("addComment should have HTML element", () => {
  render(
    <Provider store={store}>
      <AddComment postId={1} />
    </Provider>
  );
  const addCommentElement = screen.getByTestId("addComment");
  expect(addCommentElement).toContainHTML("<SFormControl");
});
