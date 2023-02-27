import styled from "styled-components";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const StyledButton = styled(Button)`
  width: 6em;
  @media (min-width: 1201px) {
    margin-right: 20%;
    position: relative;
    bottom: 80%;
    right: 60%;
  }

  @media (max-width: 1200px) {
    margin-right: 40%;
    position: relative;
    right: 100%;
    bottom: 70%;
  }

  @media (max-width: 992px) {
    margin-right: 40%;
    position: relative;
    right: 50%;
    bottom: 70%;
  }

  @media (max-width: 767px) {
    position: relative;
    margin-right: 0%;
    bottom: -20%;
    left: 10%;
  }
`;

export const CancelButton = styled(Button)`
  margin-left: 15%;

  margin-top: 2%;
  margin-bottom: 5%;
`;

export const STransparentButton = styled.button`
  border: transparent;
  background-color: transparent;
`;

export const SaveButton = styled(Button)`
  margin-top: 2%;
  margin-bottom: 5%;
`;

export const ClearButton = styled(Button)`
  margin-right: 10%;
`;

export const SearchButton = styled(Button)``;

export const SearchFontAwesome = styled(FontAwesomeIcon)``;

export const LoginButton = styled(Button)`
  margin-bottom: 40%;
  margin-top: 2%;
`;
