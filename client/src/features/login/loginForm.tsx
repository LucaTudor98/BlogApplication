import { FormEvent, useEffect, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchToken, login } from "../../store/slices/authSlice";
import { store, useAppThunkDispatch } from "../../store/store";
import { FormControl } from "./style/input";
import { useAppSelector } from "../../store/hooks";
import { Title } from "../style/title";
import { StyledFormLabel } from "../style/form";
import { LoginButton } from "../style/buttons";
import { CenteredModal } from "../popup/CenteredModal";

export const LoginForm = () => {
  const dispatch = useAppThunkDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const state = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [modalShow, setModalShow] = useState(false);
  const [serverErrorModal, setServerErrorModalShow] = useState(false);

  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (state.isUserLoggedIn) {
      navigate(-1);
    }
  });

  const handleSubmit = (event: FormEvent) => {
    const form = event.currentTarget as HTMLInputElement;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);

    if (state.error) {
      setValidated(false);
    }
  };

  const onUsernameChanged = (e: FormEvent) =>
    setUsername((e.target as HTMLInputElement).value);

  const onPasswordChanged = (e: FormEvent) =>
    setPassword((e.target as HTMLInputElement).value);

  const canLogin = [username, password].every(Boolean);

  const onLoginClicked = async (event: FormEvent) => {
    if (canLogin) {
      event.preventDefault();
      try {
        document.body.style.cursor = "wait";
        const response = await dispatch(
          fetchToken({
            username: username,
            password: password,
            grant_type: "password",
          })
        ).unwrap();

        await dispatch(login(response.access_token));
        document.body.style.cursor = "default";
      } catch (error) {
        const statusError = store.getState().auth.error;
        if (statusError === 503 || statusError === 400) {
          setModalShow(true);
        } else {
          setServerErrorModalShow(true);
        }

        document.body.style.cursor = "default";
      }
    }
  };

  return (
    <Container>
      <Title>Sign In</Title>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group controlId="validationLogin">
          <StyledFormLabel>User:</StyledFormLabel>
          <FormControl
            type="text"
            placeholder="Enter username"
            required
            onChange={onUsernameChanged}
            value={username}
          />
          <Form.Control.Feedback type="invalid">
            Please enter an username.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <StyledFormLabel>Password:</StyledFormLabel>
          <FormControl
            type="password"
            placeholder="Password"
            required
            onChange={onPasswordChanged}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a password.
          </Form.Control.Feedback>
        </Form.Group>

        <LoginButton variant="dark" type="submit" onClick={onLoginClicked}>
          Log in
        </LoginButton>
        <CenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          content={"Invalid username or password"}
        />
        <CenteredModal
          show={serverErrorModal}
          onHide={() => setServerErrorModalShow(false)}
          content={
            "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
          }
        />
      </Form>
    </Container>
  );
};
