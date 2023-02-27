import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { STransparentButton } from "../users.styles";

const Add = () => {
  let navigate = useNavigate();

  return (
    <div className="m-3">
      <STransparentButton
        data-toggle="tooltip"
        data-placement="right"
        title="Create account"
        onClick={() => navigate("/users/addUser")}
      >
        <FontAwesomeIcon icon={faUserPlus} size="3x" />
      </STransparentButton>
    </div>
  );
};

export default Add;
