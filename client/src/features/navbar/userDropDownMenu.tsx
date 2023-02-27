import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { Nav, Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { signOut } from "../../store/slices/authSlice";
import { useAppSelector } from "../../store/hooks";
import { StyledDropdownToggle } from "./style/dropdown";

export const UserDropDownMenu = () => {
  const user = useAppSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(signOut());
    navigate("/posts");
  };

  return (
    <Nav className="justify-content-end">
      <Dropdown align="end">
        <StyledDropdownToggle variant="dark">
          {user.imgPath !== undefined && user.imgPath !== "" ? (
            <img
              src={`${process.env.REACT_APP_SERVER_IMAGE_URL}${user.imgPath}`}
              className="rounded-circle"
              alt="UI"
              style={{
                height: "24px",
                border: "2px solid red",
              }}
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="fa-fw" />
          )}{" "}
          {user.name}
        </StyledDropdownToggle>

        <Dropdown.Menu variant="dark">
          <Dropdown.Item onClick={() => navigate(`/users/${user.id}`)}>
            View Profile
          </Dropdown.Item>
          <Dropdown.Item to="/" onClick={handleSignOut}>
            Sign Out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Nav>
  );
};
