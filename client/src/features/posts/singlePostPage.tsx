import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { Container, Col, Button } from "react-bootstrap";
import { deletePost, fetchPost } from "../../store/slices/postsSlice";
import { StyledButton } from "../style/buttons";
import { Title } from "../style/title";
import { Paragraph } from "../style/paragraph";
import { AuthorCol, StyledCol } from "../style/cols";
import { store, useAppThunkDispatch } from "../../store/store";
import { ModalComponent } from "../popup/ModalComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import CommentsList from "../comments/commentList";
import { getTopCommentsFromPost } from "../../store/slices/commentsSlice";
import { CommentsRow, PaddedRow } from "../style/rows";
import { LoadingComponent } from "../loading/loadingComponent";
import { CenteredModal } from "../popup/CenteredModal";
import { ICommentGetAll } from "../comments/iCommentTypes";
import { PostViewImage } from "../style/image";

export const SinglePostPage = () => {
  const [displayComments, setDisplayComments] = useState(false);
  const [commentsList, setCommentsList] = useState([] as any);
  const [getRequestStatus, setGetRequestStatus] = useState("idle");
  const [modalShow, setModalShow] = useState(false);

  const navigate = useNavigate();

  const { postId } = useParams<{ postId?: string }>();
  const loggedInUser = useAppSelector((state) => state.auth.userData);
  const dispatch = useAppThunkDispatch();
  const loading = useAppSelector((state) => state.posts.loading);
  const post = useAppSelector((state) => state.posts.post);

  useEffect(() => {
    if (getRequestStatus === "idle") {
      dispatch(fetchPost(parseInt(postId!, 10)))
        .unwrap()
        .catch(() => {
          if (store.getState().posts.error === 404) {
            navigate("/404");
          } else {
            navigate("/500");
          }
        });

      setGetRequestStatus("fulfilled");
    }
  }, [dispatch, postId, navigate, post, getRequestStatus]);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const onDeletePostClicked = async () => {
    try {
      document.body.style.cursor = "wait";
      await dispatch(deletePost(parseInt(postId!, 10))).unwrap();
      document.body.style.cursor = " default";
      navigate("/posts");
    } catch (err) {
      document.body.style.cursor = " default";
      setModalShow(true);
    }
  };

  const onEditPostClicked = () => {
    navigate(`/posts/editPost/${post.id}`);
  };

  const onDisplayComments = async () => {
    if (displayComments) {
      setCommentsList([]);
    } else {
      const receivedState = await dispatch(
        getTopCommentsFromPost({
          postId: parseInt(postId!, 10),
          page: 1,
          limit: 5,
        } as ICommentGetAll)
      );
      if (receivedState.meta.requestStatus === "rejected") {
        navigate("/500");
      }
      setCommentsList(<CommentsList postId={parseInt(postId!, 10)} />);
    }

    setDisplayComments(!displayComments);
  };

  return loading ? (
    <LoadingComponent />
  ) : (
    <Container fluid className="p-0">
      <Title>{post.title}</Title>
      <PaddedRow>
        <AuthorCol>Published by {post.authorName}</AuthorCol>
      </PaddedRow>
      <PaddedRow>
        <AuthorCol>At {new Date(post.dateCreated).toTimeString()} </AuthorCol>
      </PaddedRow>
      <PaddedRow>
        <StyledCol xs={8} sm="auto" md={4} lg={5}>
          Updated {new Date(post.dateModified).toTimeString()}
        </StyledCol>
        {loggedInUser.isAdmin || loggedInUser.name === post.authorName ? (
          <>
            <Col>
              <StyledButton
                variant="dark"
                type="button"
                onClick={onEditPostClicked}
              >
                Edit
              </StyledButton>
            </Col>
            <Col>
              <StyledButton variant="dark" type="button" onClick={handleShow}>
                Delete
              </StyledButton>
            </Col>
          </>
        ) : null}
      </PaddedRow>

      {post.image ? (
        <PostViewImage
          src={process.env.REACT_APP_SERVER_IMAGE_URL + post.image}
          alt=""
        />
      ) : null}
      <Paragraph className="post-content">{post.content}</Paragraph>
      <CommentsRow>
        <StyledCol>
          <Button variant="link" onClick={onDisplayComments}>
            <b>
              <FontAwesomeIcon
                icon={displayComments ? faCaretUp : faCaretDown}
              />
              {displayComments ? " Hide " : " Show "}
              {post.numberOfComments} Comments{" "}
            </b>
          </Button>
        </StyledCol>
      </CommentsRow>
      {commentsList}
      <ModalComponent
        title={"Delete Post"}
        content={"Are you show you want to delete this post ?"}
        show={show}
        handleClose={handleClose}
        onConfirmation={onDeletePostClicked}
      />
      <CenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        content={
          "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
        }
      />
    </Container>
  );
};
