import React, { useState } from "react";
import moment from "moment";
import { useAppDispatch } from "../../../../store/hooks";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { deleteUser } from "../../../../store/slices/usersSlice";
import { STransparentButton, SUserCard } from "../../users.styles";
import { ModalComponent } from "../../../popup/ModalComponent";

interface IUser {
  id: number;

  name: string;

  email: string;

  dateCreated: Date;

  dateModified: Date;

  imgPath?: string;
}

const UserCard = ({
  id,
  name,
  email,
  dateCreated,
  dateModified,
  imgPath,
}: IUser) => {
  const [showPopup, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const dispatch = useAppDispatch();
  let navigate = useNavigate();

  const onDelete = () => {
    dispatch(deleteUser(id));
  };

  return (
    <div>
      <SUserCard>
        <SUserCard.Body onClick={() => navigate(`/users/${id}`)}>
          {imgPath !== undefined && imgPath !== "" ? (
            <img
              src={`${process.env.REACT_APP_SERVER_IMAGE_URL}${imgPath}`}
              className="m-2 rounded-circle"
              alt="UI"
              style={{ width: "130px" }}
            />
          ) : (
            <FontAwesomeIcon
              className="m-2"
              icon={faCircleUser}
              size="8x"
              style={{ width: "130px" }}
            />
          )}

          <SUserCard.Title className="m-1" data-testid="name">
            {name}
          </SUserCard.Title>
          <SUserCard.Text data-testid="email">
            {email}
            <br />
            Date Created: {moment(dateCreated).format("YYYY-MM-DD")}
            <br />
            Date Modified: {moment(dateModified).format("YYYY-MM-DD")}
          </SUserCard.Text>
        </SUserCard.Body>
        <SUserCard.Footer>
          <STransparentButton
            data-toggle="tooltip"
            data-placement="right"
            title="Edit"
            onClick={() => navigate(`/users/editUser/${id}`)}
          >
            <FontAwesomeIcon
              icon={faPenToSquare}
              size="lg"
              style={{ color: "#fff" }}
            />
          </STransparentButton>
          <STransparentButton
            data-toggle="tooltip"
            data-placement="right"
            title="Remove"
            onClick={handleShow}
          >
            <FontAwesomeIcon
              icon={faTrashCan}
              size="lg"
              style={{ color: "#fff" }}
            />
          </STransparentButton>
        </SUserCard.Footer>
      </SUserCard>

      <ModalComponent
        title={"Delete User"}
        content={"Are you show you want to delete this user ?"}
        show={showPopup}
        handleClose={handleClose}
        onConfirmation={onDelete}
      />
    </div>
  );
};

export default UserCard;
