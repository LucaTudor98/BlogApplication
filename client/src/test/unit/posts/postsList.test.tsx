import React from "react";
import { render, screen } from "../../../utils/test-utils";
import { PostsList } from "../../../features/posts/postsList";
import IPost from "../../../features/posts/interfaces/IPost";

const testPosts: IPost[] = [
  {
    id: 1,
    title: "random",
    content: "randomContent",
    authorName: "admin",
    numberOfComments: 4,
    dateCreated: new Date(1654701094510),
    dateModified: new Date(1654701094510),
  },
  {
    id: 2,
    title: "second post",
    content: "second random content",
    authorName: "admin2",
    numberOfComments: 3,
    dateCreated: new Date(1654701094510),
    dateModified: new Date(1654701094510),
  },
];

test("renders the posts listing", async () => {
  render(<PostsList status={"succeeded"} posts={testPosts} />);

  const posts = screen.getByTestId("posts");
  expect(posts).toBeInTheDocument();
});

test("renders a post should have correct values", async () => {
  render(<PostsList status={"succeeded"} posts={[testPosts[0]]} />);

  const title = screen.getByTestId("title-value1");
  const content = screen.getByTestId("content-value1");
  const author = screen.getByTestId("authorName-value1");
  const date = screen.getByTestId("date");
  const numberOfComments = screen.getByTestId("comments");

  expect(title.textContent).toBe(testPosts[0].title);
  expect(content.textContent).toBe(testPosts[0].content);
  expect(author.textContent).toBe(`Published by: ${testPosts[0].authorName}`);
  expect(date.textContent).toBe(
    `Date published: ${testPosts[0].dateCreated.toUTCString()}`
  );
  expect(numberOfComments.textContent).toBe(
    `Comments: ${testPosts[0].numberOfComments}`
  );
});

test("0 posts should render not found posts", async () => {
  render(<PostsList status={"succeeded"} posts={[]} />);

  const missing = screen.getByTestId("missing");
  expect(missing).toBeInTheDocument();
  expect(missing.textContent).toBe("No Posts were found based on your search.");
});
