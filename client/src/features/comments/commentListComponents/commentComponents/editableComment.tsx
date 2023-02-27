import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { SFormControl } from "./editableComment.styles";
import { Button } from "react-bootstrap";
import { useAppDispatch } from "../../../../store/hooks";
import { updateComment } from "../../../../store/slices/commentsSlice";
import { CenteredModal } from "../../../popup/CenteredModal";

interface Iprop {
  id: number;
  style?: any;
  text: string;
  postId: number;
  author: number;
  parentId: number;
  notEditable: () => void;
}

const EditableComment = ({
  id,
  text,
  style,
  postId,
  author,
  parentId,
  notEditable,
}: Iprop) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLElement>(null);
  const [disabledButton, setDisabledButton] = useState(true);
  const [showServerErrorPopup, setShowServerErrorPopup] = useState(false);

  const [state, setState] = useState({
    id: id,
    postId: postId,
    parentId: parentId,
    text: text,
  });

  useLayoutEffect(() => {
    inputRef!.current!.style.height = `${inputRef.current?.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (state.text !== "") {
      setDisabledButton(false);
      return;
    }

    setDisabledButton(true);
  }, [state.text]);

  const onSubmit = async () => {
    document.body.style.cursor = "wait";

    const sentState = await dispatch(updateComment(state));

    document.body.style.cursor = "default";

    if (sentState?.meta.requestStatus === "rejected") {
      setShowServerErrorPopup(true);
      return;
    }

    notEditable();
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setState({ ...state, [name]: value.slice(0, 2499) });

    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <>
      <div
        className="row mb-2"
        style={{
          marginLeft: "-14px",
        }}
      >
        <div className="col-sm">
          <SFormControl
            ref={inputRef}
            as="textarea"
            type="text"
            name="text"
            value={state.text}
            placeholder="Edit comment..."
            onChange={handleInputChange}
            style={style}
          />
        </div>
        <div className="col-sm">
          <Button
            variant="outline-danger"
            className="m-1"
            onClick={notEditable}
          >
            Cancel
          </Button>{" "}
          <Button variant="dark" onClick={onSubmit} disabled={disabledButton}>
            Confirm
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

export default EditableComment;
