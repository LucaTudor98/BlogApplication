import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { Container } from "react-bootstrap";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  StyledFontAwesomeIcon,
  StyledUserNameSpan,
  StyledUserNameContainer,
  StyledRow,
  UserEditButton,
  UserDeleteButton,
} from "./users.styles";
import { useNavigate, useParams } from "react-router-dom";
import { deleteUser, getUser } from "../../store/slices/usersSlice";
import { ModalComponent } from "../popup/ModalComponent";
import { store, useAppThunkDispatch } from "../../store/store";
import { LoadingComponent } from "../loading/loadingComponent";
import { CenteredModal } from "../popup/CenteredModal";

export const SingleUserPage = () => {
  const { userId } = useParams();
  const dispatch = useAppThunkDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const loggedInUser = useAppSelector((state) => state.auth.userData);
  const user = useAppSelector((state) => state.users.user);
  const status = useAppSelector((state) => state.users.status);
  const [modalShow, setModalShow] = useState(false);
  const [showPopup, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }

    if (Object.keys(loggedInUser).length === 0) {
      return;
    }

    dispatch(getUser(parseInt(userId!)))
      .unwrap()
      .catch(() => {
        const statusError = parseInt(store.getState().users.error, 10);
        switch (statusError) {
          case 404: {
            navigate("/404");
            break;
          }
          case 403: {
            navigate("/403");
            break;
          }
          default: {
            navigate("/500");
            break;
          }
        }
      });
  }, [dispatch, isLoggedIn, loggedInUser, navigate, userId]);

  const onDeleteUserClicked = async () => {
    try {
      document.body.style.cursor = "wait";
      await dispatch(deleteUser(parseInt(userId!))).unwrap();
      document.body.style.cursor = " default";
      navigate("/posts");
    } catch (err) {
      setModalShow(true);
      document.body.style.cursor = " default";
    }
  };

  return status === "loading" ? (
    <LoadingComponent />
  ) : (
    <>
      <StyledUserNameContainer fluid className="p-0">
        {user.imgPath !== undefined && user.imgPath !== "" ? (
          <img
            src={`${process.env.REACT_APP_SERVER_IMAGE_URL}${user.imgPath}`}
            className="m-2 rounded-circle"
            alt="UI"
            style={{ width: "130px" }}
          />
        ) : (
          <StyledFontAwesomeIcon icon={faUser} className="fa-fw fa-3x" />
        )}
        <StyledUserNameSpan>{user.name}</StyledUserNameSpan>
      </StyledUserNameContainer>
      <Container>
        <StyledRow className="justify-content-center">
          Email: {user.email}
        </StyledRow>
        <StyledRow className="justify-content-center">
          Created at: {user.dateCreated}
        </StyledRow>
        <StyledRow className="justify-content-center">
          Admin: {String(user.isAdmin)}
        </StyledRow>
        <UserEditButton
          variant="dark"
          onClick={() => navigate(`/users/editUser/${user.id}`)}
        >
          Edit Profile
        </UserEditButton>
        <UserDeleteButton variant="dark" onClick={handleShow}>
          Delete Profile
        </UserDeleteButton>

        <ModalComponent
          title={"Delete User"}
          content={"Are you show you want to delete this user ?"}
          show={showPopup}
          handleClose={handleClose}
          onConfirmation={onDeleteUserClicked}
        />
        <CenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          content={
            "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
          }
        />
      </Container>
    </>
  );
};
