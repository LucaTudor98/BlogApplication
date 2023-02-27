import React, { useState } from "react";
import moment from "moment";
import { deleteComment } from "../../../../../store/slices/commentsSlice";
import CommentText from "../commentText";
import IComment from "../../../iCommentTypes";

import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import AddReply from "./addReply";
import { ModalComponent } from "../../../../popup/ModalComponent";
import EditableComment from "../editableComment";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { StyledColum } from "../../comment.styles";
import { STransparentButton } from "./../../../../style/buttons";
import { CenteredModal } from "../../../../popup/CenteredModal";

const Reply = ({
  id,
  postId,
  parentId,
  author,
  authorName,
  dateCreated,
  text,
  authorAvatarPath,
}: IComment) => {
  const [showServerErrorPopup, setShowServerErrorPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyBox, setReplyBox] = useState([] as any);
  const [isEditable, setIsEditable] = useState(false);
  const dispatch = useAppDispatch();
  const isUserLoggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const loggedInUserId = useAppSelector((state) => state.auth.userData.id);
  const loggedInUserIsAdmin = useAppSelector(
    (state) => state.auth.userData.isAdmin
  );

  const onEditReply = () => {
    setIsEditable(!isEditable);
  };

  const onDeleteReply = async (id: number) => {
    document.body.style.cursor = "wait";

    const sentState = await dispatch(
      deleteComment({ id: id, parentId: parentId })
    );

    document.body.style.cursor = "default";

    if (sentState.meta.requestStatus === "rejected") {
      setShowServerErrorPopup(true);
      return;
    }

    setShowDeletePopup(false);
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

  return (
    <>
      <Row className="mb-3 mt-3">
        <Col xs="auto">
          <img
            src={
              authorAvatarPath !== undefined && authorAvatarPath !== ""
                ? `${process.env.REACT_APP_SERVER_IMAGE_URL}${authorAvatarPath}`
                : `https://ui-avatars.com/api/?name=${authorName}&background=random`
            }
            className="rounded-circle"
            alt="UI"
            style={{ width: "30px" }}
          />
        </Col>
        <StyledColum>
          <h4 style={{ display: "inline-block", verticalAlign: "baseline" }}>
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
              style={{ minWidth: "208px" }}
            />
          ) : (
            <div className="row mt-1">
              <CommentText text={text} />
            </div>
          )}
          <p style={{ fontSize: "12px" }}>
            {loggedInUserIsAdmin || loggedInUserId === author ? (
              <>
                <STransparentButton onClick={() => onEditReply()}>
                  <i>{"Edit"}</i>
                </STransparentButton>{" "}
                <STransparentButton onClick={() => setShowDeletePopup(true)}>
                  <i>{"Delete"}</i>
                </STransparentButton>{" "}
              </>
            ) : null}
            {isUserLoggedIn ? (
              <>
                {" "}
                <STransparentButton onClick={() => onReply(postId, parentId)}>
                  <i>
                    {"Reply "}
                    <FontAwesomeIcon icon={faReply} />
                  </i>
                </STransparentButton>{" "}
              </>
            ) : null}
          </p>
        </StyledColum>
      </Row>
      {showReplyBox ? replyBox : null}
      <ModalComponent
        title={"Delete reply"}
        content={"Are you show you want to delete this reply ?"}
        show={showDeletePopup}
        handleClose={() => setShowDeletePopup(false)}
        onConfirmation={() => onDeleteReply(id)}
      />
      <CenteredModal
        show={showServerErrorPopup}
        onHide={() => setShowServerErrorPopup(false)}
        content={
          "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
        }
      />
    </>
  );
};

export default Reply;
