import React, { useEffect, useLayoutEffect, useState } from "react";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  deleteComment,
  getRepliesFromComment,
} from "../../../store/slices/commentsSlice";
import AddReply from "./commentComponents/replyListComponents/addReply";
import RepliesList from "./commentComponents/replyList";
import EditableComment from "./commentComponents/editableComment";
import CommentText from "../commentListComponents/commentComponents/commentText";
import IComment from "../iCommentTypes";

import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReply,
  faCaretDown,
  faCaretUp,
} from "@fortawesome/free-solid-svg-icons";
import { ModalComponent } from "../../popup/ModalComponent";
import { StyledColum } from "./comment.styles";
import { STransparentButton } from "../../style/buttons";
import { CenteredModal } from "../../popup/CenteredModal";
import { StyledDiv } from "../commentList.styles";

const Comment = ({
  id,
  author,
  authorName,
  postId,
  parentId,
  dateCreated,
  text,
  replies,
  replyCount,
  authorAvatarPath,
}: IComment) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showServerErrorPopup, setShowServerErrorPopup] = useState(false);
  const defaultLimit = 5;

  const [displayReplies, setDisplayReplies] = useState(false);
  const [returnReplies, setReturnReplies] = useState([] as any);
  const [hasMore, setHasMore] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyBox, setReplyBox] = useState([] as any);
  const [isEditable, setIsEditable] = useState(false);

  const dispatch = useAppDispatch();

  const isUserLoggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const loggedInUserId = useAppSelector((state) => state.auth.userData.id);
  const loggedInUserIsAdmin = useAppSelector(
    (state) => state.auth.userData.isAdmin
  );

  const onDisplayReplies = async (
    parentId: number,
    postId: number,
    limit: number
  ) => {
    let sentState;

    if (displayReplies) {
      setReturnReplies([]);
    } else {
      document.body.style.cursor = "wait";

      sentState = await dispatch(
        getRepliesFromComment({
          postId: postId,
          parentId: parentId,
          page: 1,
          limit: limit,
        })
      );

      setReturnReplies([
        <RepliesList
          key={id}
          replies={sentState.payload.result}
          setDisplayReplies={() => setDisplayReplies}
        />,
      ]);
    }

    document.body.style.cursor = "default";

    if (sentState?.meta.requestStatus === "rejected") {
      setShowServerErrorPopup(true);
      return;
    }

    setHasMore(sentState?.payload.hasNext);
    setDisplayReplies(!displayReplies);
  };

  const displayMoreReplies = async (
    parentId: number,
    postId: number,
    limit: number
  ) => {
    const sentState = await dispatch(
      getRepliesFromComment({
        postId: postId,
        parentId: parentId,
        page: 1,
        limit: limit,
      })
    );

    setReturnReplies([
      <RepliesList
        key={id}
        replies={sentState.payload.result}
        setDisplayReplies={() => setDisplayReplies(false)}
      />,
    ]);

    setHasMore(sentState?.payload.hasNext);
  };

  const onEditComment = () => {
    setIsEditable(!isEditable);
  };

  const onDeleteComment = async (id: number) => {
    document.body.style.cursor = "wait";

    const sentState = await dispatch(
      deleteComment({ id: id, parentId: parentId })
    );

    document.body.style.cursor = "default";

    if (sentState.meta.requestStatus === "rejected") {
      setShowServerErrorPopup(true);
    }
  };

  const onReply = (postId: number, parentId: number) => {
    if (showReplyBox) {
      setReplyBox([]);
    } else {
      setReplyBox(
        <AddReply
          postId={postId}
          parentId={parentId}
          onCancel={() => setShowReplyBox(false)}
        />
      );
    }

    setShowReplyBox(!showReplyBox);
  };

  useEffect(() => {
    setReturnReplies([
      <RepliesList
        key={id}
        replies={replies}
        setDisplayReplies={() => setDisplayReplies(false)}
      />,
    ]);

    if (!replies) {
      return;
    }

    if (replies.length > defaultLimit) {
      setHasMore(true);
    }

    setDisplayReplies(true);
  }, [id, replies]);

  useLayoutEffect(() => {
    return () => {
      setDisplayReplies(false);
    };
  }, []);

  return (
    <div
      data-testid="comment"
      style={{ whiteSpace: "pre-wrap" }}
      className="mt-4"
    >
      <Row>
        <Col xs="auto">
          <img
            src={
              authorAvatarPath !== undefined && authorAvatarPath !== ""
                ? `${process.env.REACT_APP_SERVER_IMAGE_URL}${authorAvatarPath}`
                : `https://ui-avatars.com/api/?name=${authorName}&background=random`
            }
            className="rounded-circle"
            alt="UI"
            style={{ width: "50px" }}
          />
        </Col>
        <StyledColum>
          <h4
            style={{
              display: "inline-block",
              verticalAlign: "baseline",
            }}
          >
            {authorName}
          </h4>{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            <em>{moment(dateCreated).fromNow()}</em>
          </span>
          {isEditable ? (
            <EditableComment
              id={id}
              postId={postId}
              parentId={parentId}
              author={author}
              text={text}
              notEditable={() => setIsEditable(false)}
            />
          ) : (
            <div className="row mt-1">
              <CommentText text={text} />
            </div>
          )}
          <p style={{ fontSize: "12px" }}>
            {loggedInUserId === author || loggedInUserIsAdmin ? (
              <>
                <STransparentButton onClick={() => onEditComment()}>
                  <i>{"Edit"}</i>
                </STransparentButton>{" "}
                <STransparentButton onClick={() => setShowDeletePopup(true)}>
                  <i>{"Delete"}</i>
                </STransparentButton>{" "}
              </>
            ) : null}
            {isUserLoggedIn ? (
              <>
                <STransparentButton
                  onClick={() =>
                    onReply(postId, parentId === null ? id : parentId)
                  }
                >
                  <i>
                    {"Reply "}{" "}
                    <FontAwesomeIcon
                      icon={faReply}
                      style={{ whiteSpace: "nowrap" }}
                    />
                  </i>
                </STransparentButton>{" "}
              </>
            ) : null}

            {replyCount === "0" || replyCount === undefined ? null : (
              <STransparentButton
                className="mt-1"
                onClick={() => onDisplayReplies(id, postId, defaultLimit)}
              >
                <i>
                  <FontAwesomeIcon
                    icon={displayReplies ? faCaretUp : faCaretDown}
                  />
                  {displayReplies ? " Hide " : " Show "}
                  {replyCount}
                  {" replies "}
                </i>
              </STransparentButton>
            )}
          </p>
        </StyledColum>
      </Row>
      {showReplyBox ? replyBox : null}
      {returnReplies}

      {hasMore ? (
        <StyledDiv
          onClick={() =>
            displayMoreReplies(
              id,
              postId,
              replyCount === undefined
                ? 0
                : returnReplies[0].props.replies.length + defaultLimit
            )
          }
        >
          Show more replies
        </StyledDiv>
      ) : null}
      <ModalComponent
        title={"Delete Comment"}
        content={"Are you show you want to delete this comment ?"}
        show={showDeletePopup}
        handleClose={() => setShowDeletePopup(false)}
        onConfirmation={() => onDeleteComment(id)}
      />
      <CenteredModal
        show={showServerErrorPopup}
        onHide={() => setShowServerErrorPopup(false)}
        content={
          "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
        }
      />
    </div>
  );
};

export default Comment;
