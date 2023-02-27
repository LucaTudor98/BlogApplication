import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  addComment,
  getRepliesFromComment,
} from "../../../../../store/slices/commentsSlice";
import { CenteredModal } from "../../../../popup/CenteredModal";
import { Button } from "react-bootstrap";
import { SFormControl } from "./addReply.styles";

interface Iprop {
  postId: number;
  parentId: number;
  onCancel: () => void;
}

const AddReply = ({ postId, parentId, onCancel }: Iprop) => {
  const dispatch = useAppDispatch();
  const [disabledButton, setDisabledButton] = useState(true);
  const [showServerErrorPopup, setShowServerErrorPopup] = useState(false);

  const inputRef = useRef<HTMLElement>();

  const [state, setState] = useState({
    postId: postId,
    parentId: parentId,
    text: "",
    authorName: useAppSelector((state) => state.auth.userData.name),
    authorAvatarPath: useAppSelector((state) => state.auth.userData.imgPath),
    replyCount: "0",
  });

  useEffect(() => {
    if (state.text !== "") {
      setDisabledButton(false);
      return;
    }

    setDisabledButton(true);
  }, [state.text]);

  const { text } = { ...state };

  const onSubmit = async () => {
    await dispatch(
      getRepliesFromComment({
        parentId: state.parentId,
        postId: state.postId,
        page: 1,
        limit: 5,
      })
    );
    document.body.style.cursor = "wait";

    const sentState = await dispatch(addComment(state));
    document.body.style.cursor = "default";

    if (sentState.meta.requestStatus === "rejected") {
      setShowServerErrorPopup(true);
      return;
    }

    onCancel();
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setState({ ...state, [name]: value });

    e.target.style.height = "inherit";

    if (value === "") {
      e.target.style.height = "52px";
      return;
    }

    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <>
      <div className="row mb-3" style={{ marginLeft: "-3px" }}>
        <div className="col-sm m-1">
          <SFormControl
            autoFocus
            ref={inputRef}
            as="textarea"
            type="text"
            name="text"
            value={text}
            placeholder="What is you're reply?"
            onChange={handleInputChange}
          />{" "}
        </div>

        <div className="col-sm">
          <Button variant="outline-danger" className="m-1" onClick={onCancel}>
            Cancel
          </Button>{" "}
          <Button variant="dark" onClick={onSubmit} disabled={disabledButton}>
            Reply
          </Button>
        </div>
      </div>
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

export default AddReply;
