import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { addUser, addUserImg } from "../../store/slices/usersSlice";
import { IUserAddImg } from "./iUserTypes";

import { FloatingLabel, Form, Button } from "react-bootstrap";
import { SUserCard, STransparentButton } from "./users.styles";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { CenteredModal } from "../popup/CenteredModal";
import { CroppedModal } from "../popup/CropModal";

interface Iprop {
  isAdmin: boolean;
}

interface IState {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

interface IUploadedImg {
  img: string;
  imgName: string;
}

const AddUser = ({ isAdmin }: Iprop) => {
  const isUserLoggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const inputRef = useRef<HTMLInputElement>(null);
  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [state, setState] = useState<IState>({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });
  const [modalShow, setModalShow] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<IUploadedImg>({
    img: "",
    imgName: "",
  });
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const { name, email, password } = { ...state };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  useEffect(() => {
    (document.getElementById("confirm") as HTMLInputElement).disabled = true;

    if (name !== "" && email !== "" && password !== "") {
      (document.getElementById("confirm") as HTMLInputElement).disabled = false;
    }
  }, [name, email, password]);

  useEffect(() => {
    const generateImage = async () => {
      image.src = await convertToBase64(croppedImageFile as File);
    };

    var image = document.getElementById("image") as HTMLImageElement;

    if (image != null) {
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

  const onSubmit = async () => {
    try {
      document.body.style.cursor = "wait";

      const createdUser = await dispatch(addUser(state)).unwrap();

      if (croppedImageFile !== null && isAdmin === true) {
        const fd = new FormData();
        fd.append("avatar", croppedImageFile, croppedImageFile.name);

        await dispatch(
          addUserImg({
            id: createdUser.id,
            avatar: fd,
          } as IUserAddImg)
        );
      }

      document.body.style.cursor = " default";
    } catch (err) {
      setModalShow(true);
      document.body.style.cursor = " default";
      return;
    }
    isAdmin ? navigate("/users") : navigate("/login", { replace: true });
  };

  const croppedModalProps = {
    image: uploadedImage.img,
    imageName: uploadedImage.imgName,
    show: showCropModal,
    handleClose: () => setShowCropModal(false),
    setCroppedImage: setCroppedImageFile,
  };

  return (
    <span className="m-3">
      <SUserCard title="UserCard">
        <SUserCard.Body>
          <div className="mb-3 mt-2">
            {croppedImageFile !== null ? (
              <img
                id="image"
                src={URL.createObjectURL(croppedImageFile)}
                className="rounded-circle"
                alt="ok"
              />
            ) : (
              <FontAwesomeIcon icon={faUserPlus} size="6x" />
            )}
          </div>
          <div className="mb-2">
            <Form.Control
              name="img"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={inputRef}
              onChange={(e) => imageHandler(e)}
            />
            {isAdmin || isUserLoggedIn ? (
              <Button
                variant="outline-danger"
                className="m-1"
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                Upload a profile picture
              </Button>
            ) : null}
          </div>
          <FloatingLabel label="Name" className="mb-2">
            <Form.Control
              name="name"
              type="text"
              data-testid="name-input"
              value={name}
              onChange={handleInputChange}
            />
          </FloatingLabel>
          <FloatingLabel label="Email" className="mb-2">
            <Form.Control
              name="email"
              type="email"
              data-testid="email-input"
              value={email}
              onChange={handleInputChange}
            />
          </FloatingLabel>
          <FloatingLabel label="Password" className="mb-2">
            <Form.Control
              name="password"
              type="password"
              data-testid="password-input"
              value={password}
              onChange={handleInputChange}
            />
          </FloatingLabel>
          {isAdmin ? (
            <>
              <Form.Check
                inline
                label="Admin"
                data-testid="isAdmin-checkbox"
                type="checkbox"
                onChange={(e) =>
                  setState({ ...state, isAdmin: e.target.checked })
                }
              />
            </>
          ) : null}
        </SUserCard.Body>
        <SUserCard.Footer>
          <STransparentButton
            className="btn"
            id="confirm"
            disabled
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
            className="btn"
            data-toggle="tooltip"
            data-placement="right"
            title="Cancel"
            onClick={() => {
              isAdmin ? navigate("/users") : navigate("/login");
            }}
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
    </span>
  );
};

export default AddUser;
