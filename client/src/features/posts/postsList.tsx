import { StyledLink } from "../style/links";
import { StyledRow } from "../style/rows";
import { StyledCard } from "../style/card";
import { Card } from "react-bootstrap";
import { CardTitle } from "../style/title";
import { StyledText } from "../style/paragraph";
import IPost from "./interfaces/IPost";
import { CardImage } from "../style/image";

interface IProps {
  status: string;
  posts: IPost[];
}

export const PostsList = (props: IProps) => {
  let content = null;

  if (props.status === "succeeded") {
    if (props.posts.length === 0) {
      content = (
        <StyledText data-testid="missing">
          No Posts were found based on your search.
        </StyledText>
      );
    } else {
      content = props.posts.map((post) => (
        <StyledLink key={post.id} to={`/posts/${post.id}`}>
          <StyledCard bg="light" border="dark">
            <CardTitle
              className="button muted-button"
              data-testid={`title-value${post.id}`}
            >
              {post.title}
            </CardTitle>
            <StyledRow data-testid={`authorName-value${post.id}`}>
              Published by: {post.authorName}
            </StyledRow>
            <StyledRow
              className="postContent"
              data-testid={`content-value${post.id}`}
            >
              {post.content}
            </StyledRow>
            {post.image ? (
              <CardImage
                src={process.env.REACT_APP_SERVER_IMAGE_URL + post.image}
                alt=""
                className="postImage"
              />
            ) : null}
            <Card.Footer data-testid="date">
              Date published: {new Date(post.dateCreated).toTimeString()}
            </Card.Footer>
            <Card.Footer data-testid="comments">
              Comments: {post.numberOfComments}
            </Card.Footer>
          </StyledCard>
        </StyledLink>
      ));
    }
  }

  return (
    <article className="postsList" data-testid="posts">
      {content}
    </article>
  );
};
