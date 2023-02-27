import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import {
  updatePost,
  selectCurrentPost,
  fetchPost,
  uploadImage,
} from "../../store/slices/postsSlice";
import { Container, Form } from "react-bootstrap";
import { CancelButton, SaveButton } from "../style/buttons";
import { store, useAppThunkDispatch } from "../../store/store";
import { StyledFormLabel } from "../style/form";
import { Title } from "../style/title";
import { CenteredModal } from "../popup/CenteredModal";
import { StyledImage } from "../style/image";

export const EditPostForm = () => {
  const { postId } = useParams();

  let post = useAppSelector(selectCurrentPost);

  const [getRequestStatus, setGetRequestStatus] = useState("idle");
  const stateAuth = useAppSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState<File>();
  const [preview, setPreview] = useState<string>();

  const [modalShow, setModalShow] = useState(false);

  const dispatch = useAppThunkDispatch();
  const navigate = useNavigate();

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
  }, [dispatch, getRequestStatus, navigate, postId]);

  useEffect(() => {
    if (!stateAuth.isUserLoggedIn) {
      navigate("/login");
    }

    if (Object.keys(stateAuth.userData).length === 0) {
      return;
    }

    if (
      !(
        stateAuth.userData.isAdmin ||
        stateAuth.userData.name === post.authorName
      )
    ) {
      navigate("/403");
    }
  }, [navigate, post, stateAuth]);

  const [title, setTitle] = useState(post!.title);
  const [content, setContent] = useState(post!.content);
  const [validated, setValidated] = useState(false);
  const [updateRequestStatus, setUpdateRequestStatus] = useState("idle");

  const canSave =
    [title, content].every(Boolean) && updateRequestStatus === "idle";

  const onTitleChanged = (e: FormEvent) =>
    setTitle((e.target as HTMLInputElement).value);
  const onContentChanged = (e: FormEvent) =>
    setContent((e.target as HTMLInputElement).value);

  const handleSubmit = (event: FormEvent) => {
    const form = event.currentTarget as HTMLInputElement;

    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
  };

  const onCancelEditClicked = () => {
    navigate(`/posts/${postId}`);
  };

  const id = parseInt(postId!, 10);

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

        setUpdateRequestStatus("pending");
        const response = await dispatch(
          updatePost({
            id,
            title,
            content,
            fileName: imageResponse ? imageResponse.path : null,
          })
        ).unwrap();

        setUpdateRequestStatus("idle");

        document.body.style.cursor = " default";

        navigate(`/posts/${response.id}`);
      } catch (err) {
        document.body.style.cursor = " default";
        setModalShow(true);
        setUpdateRequestStatus("idle");
      }
    }
  };

  if (!post) {
    return (
      <section>
        <h2>No post found</h2>
      </section>
    );
  }

  return (
    <Container>
      <Title>Edit Post</Title>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="editTitle" controlId="validationEditPostTitle">
          <StyledFormLabel>Post Title:</StyledFormLabel>
          <Form.Control
            required
            type="text"
            placeholder="Post title"
            defaultValue={title}
            onChange={onTitleChanged}
          />
          <Form.Control.Feedback type="invalid">
            Please enter the post title.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationEditPostContent">
          <StyledFormLabel>Content:</StyledFormLabel>
          <Form.Control
            required
            as="textarea"
            placeholder="Post content"
            rows={20}
            defaultValue={content}
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
        >
          <Form.Label>Upload an image</Form.Label>
          <Form.Control type="file" size="sm" accept="image/*" />

          {selectedFile && <StyledImage src={preview} />}
        </Form.Group>

        <SaveButton
          variant="dark"
          type="submit"
          onClick={onSavePostClicked}
          disabled={!canSave}
        >
          Save Post
        </SaveButton>

        <CancelButton
          variant="dark"
          type="submit"
          onClick={onCancelEditClicked}
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
