import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import { addNewPost, uploadImage } from "../../store/slices/postsSlice";
import { useAppThunkDispatch } from "../../store/store";
import { CancelButton, SaveButton } from "../style/buttons";
import { Title } from "../style/title";
import { StyledFormLabel } from "../style/form";
import { CenteredModal } from "../popup/CenteredModal";
import { StyledImage } from "../style/image";

interface IProps {
  isLoggedIn: boolean;
}

export const AddPostPage = ({ isLoggedIn }: IProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [addRequestStatus, setAddRequestStatus] = useState("idle");

  const [modalShow, setModalShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [preview, setPreview] = useState<string>();

  const canSave =
    [title, content].every(Boolean) && addRequestStatus === "idle";

  const dispatch = useAppThunkDispatch();
  const navigate = useNavigate();

  const onTitleChanged = (e: FormEvent) =>
    setTitle((e.target as HTMLInputElement).value);
  const onContentChanged = (e: FormEvent) =>
    setContent((e.target as HTMLInputElement).value);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    if (e.target.files[0].type.includes("image")) {
      setSelectedFile(e.target.files[0]);
    } else {
      e.target.value = "";
      setSelectedFile(undefined);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  });

  const handleSubmit = (event: FormEvent) => {
    const form = event.currentTarget as HTMLInputElement;

    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
  };

  const onSavePostClicked = async () => {
    let imageResponse;
    if (canSave) {
      document.body.style.cursor = "wait";
      try {
        if (selectedFile) {
          const formData = new FormData();
          formData.append("image", selectedFile);
          imageResponse = await dispatch(uploadImage(formData)).unwrap();
        }

        setAddRequestStatus("pending");
        const response = await dispatch(
          addNewPost({
            title,
            content,
            fileName: imageResponse ? imageResponse.path : null,
          })
        ).unwrap();

        setTitle("");
        setContent("");

        document.body.style.cursor = " default";

        navigate(`/posts/${response.id}`);
      } catch (err) {
        document.body.style.cursor = " default";
        setModalShow(true);
        setAddRequestStatus("idle");
      }
    }
  };

  const onCancelSaveClicked = () => {
    navigate(`/posts`);
  };

  return (
    <Container data-testid="container">
      <Title>Add a new Post</Title>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group controlId="validationPostTitle">
          <StyledFormLabel>Post Title</StyledFormLabel>
          <Form.Control
            type="text"
            placeholder="Title"
            data-testid="title-input"
            required
            value={title}
            onChange={onTitleChanged}
          />
          <Form.Control.Feedback type="invalid">
            Please enter the post title.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationPostContent">
          <StyledFormLabel>Post Content</StyledFormLabel>
          <Form.Control
            as="textarea"
            placeholder="Enter post content"
            data-testid="content-input"
            required
            rows={20}
            value={content}
            onChange={onContentChanged}
          />
          <Form.Control.Feedback type="invalid">
            Please enter the post content.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group
          controlId="formFileSm"
          className="mb-3"
          onChange={onSelectFile}
          id="uploadForm"
        >
          <Form.Label>Upload an image</Form.Label>
          <Form.Control type="file" size="sm" accept="image/*" />

          {selectedFile && <StyledImage src={preview} />}
        </Form.Group>

        <SaveButton
          variant="dark"
          type="submit"
          data-testid="save"
          onClick={onSavePostClicked}
          disabled={!canSave}
        >
          Save Post
        </SaveButton>
        <CancelButton
          variant="dark"
          data-testid="cancel"
          type="submit"
          onClick={onCancelSaveClicked}
        >
          Cancel
        </CancelButton>
      </Form>

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
