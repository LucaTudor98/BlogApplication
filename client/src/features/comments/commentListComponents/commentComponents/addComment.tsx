import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { addComment } from "../../../../store/slices/commentsSlice";
import { CenteredModal } from "../../../popup/CenteredModal";

import { Button, Row, Col } from "react-bootstrap";
import { SFormControl } from "./addComment.styles";

interface Iprop {
  postId: number;
}

const AddComment = ({ postId }: Iprop) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLElement>();
  const [disabledButton, setDisabledButton] = useState(true);
  const [showServerErrorPopup, setShowServerErrorPopup] = useState(false);

  const [state, setState] = useState({
    authorName: useAppSelector((state) => state.auth.userData.name),
    postId: postId,
    parentId: null,
    text: "",
    authorAvatarPath: useAppSelector((state) => state.auth.userData.imgPath),
    replyCount: "0",
  });

  const { text } = { ...state };

  useEffect(() => {
    if (state.text !== "") {
      setDisabledButton(false);
      return;
    }

    setDisabledButton(true);
  }, [state.text]);

  const resetInputFormHeight = () => (inputRef!.current!.style.height = "52px");

  const onSubmit = async () => {
    document.body.style.cursor = "wait";

    const sentState = await dispatch(addComment(state));

    document.body.style.cursor = "default";

    if (sentState.meta.requestStatus === "rejected") {
      setShowServerErrorPopup(true);
      return;
    }

    removeComment();
    resetInputFormHeight();
  };

  const removeComment = () => {
    setState({ ...state, text: "" });
    resetInputFormHeight();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setState({
      ...state,
      [name]: value.slice(0, 2499),
    });

    e.target.style.height = "inherit";

    if (value === "") {
      e.target.style.height = "52px";
      return;
    }

    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <>
      <Row className="mb-3" data-testid="addComment">
        <Col xs="auto">
          <SFormControl
            ref={inputRef}
            as="textarea"
            type="text"
            name="text"
            value={text}
            placeholder="Add a comment..."
            onChange={handleInputChange}
          />{" "}
        </Col>
        <Col>
          <Button
            variant="outline-danger"
            className="m-1"
            onClick={removeComment}
          >
            Cancel
          </Button>{" "}
          <Button variant="dark" onClick={onSubmit} disabled={disabledButton}>
            Comment
          </Button>
        </Col>
      </Row>
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

export default AddComment;
