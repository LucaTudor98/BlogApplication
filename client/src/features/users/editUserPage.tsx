import React, { useState, useEffect, FormEvent, useRef } from "react";
import { IUserAddImg } from "./iUserTypes";
import { getUser, updateUser, addUserImg } from "../../store/slices/usersSlice";
import { useAppSelector } from "../../store/hooks";
import { useNavigate, useParams } from "react-router-dom";

import { FloatingLabel, Form, Button } from "react-bootstrap";
import { SUserCard, STransparentButton } from "./users.styles";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { store, useAppThunkDispatch } from "../../store/store";
import { LoadingComponent } from "../loading/loadingComponent";
import { CenteredModal } from "../popup/CenteredModal";
import { CroppedModal } from "../popup/CropModal";

interface IUploadedImg {
  img: string;
  imgName: string;
}

export const EditUser = () => {
  const { id } = useParams();
  let navigate = useNavigate();
  const dispatch = useAppThunkDispatch();
  const [modalShow, setModalShow] = useState(false);
  const usersState = useAppSelector((state) => state.users);
  const stateAuth = useAppSelector((state) => state.auth);
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadedImage, setUploadedImage] = useState<IUploadedImg>({
    img: "",
    imgName: "",
  });
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const [state, setState] = useState({
    id: parseInt(id!),
    name: usersState.user.name,
    email: usersState.user.email,
    password: undefined,
    isAdmin: usersState.user.isAdmin,
    imgPath: usersState.user.imgPath,
  });
  const { name, email, password, isAdmin, imgPath } = { ...state };

  useEffect(() => {
    dispatch(getUser(parseInt(id!)))
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
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (!stateAuth.isUserLoggedIn) {
      navigate("/login");
    }
  }, [id, navigate, stateAuth.isUserLoggedIn, stateAuth.userData]);

  useEffect(() => {
    if (usersState.user) {
      setState({
        id: usersState.user.id,
        name: usersState.user.name,
        email: usersState.user.email,
        password: undefined,
        isAdmin: usersState.user.isAdmin,
        imgPath: usersState.user.imgPath,
      });
    }
  }, [usersState.user]);

  useEffect(() => {
    (document.getElementById("confirm") as HTMLInputElement).disabled = false;

    if (name === "" || email === "") {
      (document.getElementById("confirm") as HTMLInputElement).disabled = true;
    }
  }, [name, email, password]);

  useEffect(() => {
    if (croppedImageFile != null) {
      var image = document.getElementById("image") as HTMLImageElement;

      const generateImage = async () => {
        image.src = await convertToBase64(croppedImageFile as File);
      };

      generateImage();
    }
  }, [croppedImageFile]);

  const imageHandler = async (e: FormEvent) => {
    if ((e.target as HTMLInputElement).files?.item(0) !== null) {
      const base64Img = await convertToBase64(
        (e.target as HTMLInputElement).files?.item(0) as File
      );

      setUploadedImage({
        img: base64Img,
        imgName: (e.target as HTMLInputElement).files?.item(0)?.name as string,
      });

      setShowCropModal(true);

      (e.target as HTMLInputElement).value = "";
    }
  };

  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const onSubmit = async () => {
    try {
      document.body.style.cursor = "wait";

      const editedUser = await dispatch(updateUser(state)).unwrap();

      if (croppedImageFile !== null) {
        const fd = new FormData();

        fd.append("avatar", croppedImageFile, croppedImageFile.name);

        await dispatch(
          addUserImg({
            id: editedUser.id,
            avatar: fd,
          } as IUserAddImg)
        ).unwrap();
      }

      document.body.style.cursor = " default";
      navigate(-1);
    } catch (err) {
      setModalShow(true);
      document.body.style.cursor = " default";
    }
  };

  const croppedModalProps = {
    image: uploadedImage.img,
    imageName: uploadedImage.imgName,
    show: showCropModal,
    handleClose: () => setShowCropModal(false),
    setCroppedImage: setCroppedImageFile,
  };

  return usersState.status === "loading" ? (
    <LoadingComponent />
  ) : (
    <div className="m-3">
      <SUserCard>
        <SUserCard.Body>
          <div className="mb-3 mt-2">
            {croppedImageFile !== null ||
            (imgPath !== undefined && imgPath !== "") ? (
              <img
                id="image"
                src={
                  croppedImageFile !== null
                    ? URL.createObjectURL(croppedImageFile)
                    : `${process.env.REACT_APP_SERVER_IMAGE_URL}${imgPath}`
                }
                className="rounded-circle"
                alt="ok"
              />
            ) : (
              <FontAwesomeIcon
                icon={faUserPen}
                size="6x"
                className="mb-3 mt-2"
              />
            )}
          </div>
          <SUserCard.Text>
            <div className="mb-2">
              <Form.Control
                name="img"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={inputRef}
                onChange={(e) => imageHandler(e)}
              />
              <Button
                variant="outline-danger"
                className="m-1"
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                Change profile picture
              </Button>
            </div>
            <FloatingLabel label="Name" className="mb-2">
              <Form.Control
                name="name"
                type="text"
                value={name}
                onChange={handleInputChange}
              />
            </FloatingLabel>
            <FloatingLabel label="Email" className="mb-2">
              <Form.Control
                name="email"
                type="email"
                value={email}
                onChange={handleInputChange}
              />
            </FloatingLabel>
            <FloatingLabel label="new password" className="mb-2">
              <Form.Control
                name="password"
                type="password"
                value={password}
                onChange={handleInputChange}
              />
            </FloatingLabel>
            <Form.Check
              inline
              label="Admin"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) =>
                setState({ ...state, isAdmin: e.target.checked })
              }
            />
          </SUserCard.Text>
        </SUserCard.Body>
        <SUserCard.Footer>
          <STransparentButton
            id="confirm"
            data-toggle="tooltip"
            data-placement="right"
            title="Confirm"
          >
            <FontAwesomeIcon
              icon={faCheck}
              size="lg"
              style={{ color: "#fff" }}
              onClick={onSubmit}
            />
          </STransparentButton>
          <STransparentButton
            data-toggle="tooltip"
            data-placement="right"
            title="Cancel"
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon
              icon={faXmark}
              size="lg"
              style={{ color: "#fff" }}
            />
          </STransparentButton>
        </SUserCard.Footer>
      </SUserCard>
      <CroppedModal {...croppedModalProps} />
      <CenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        content={
          "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
        }
      />
    </div>
  );
};

export default EditUser;
