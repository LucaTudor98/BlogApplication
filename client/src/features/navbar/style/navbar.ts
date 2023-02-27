import styled from "styled-components";
import { Navbar } from "react-bootstrap";

export const StyledBrand = styled(Navbar.Brand)`
  color: white;
  font-size: 1.4em;
  text-decoration: none;
  margin-right: 4%;
  &: hover {
    color: white;
  }
  @media (max-width: 586px) {
    margin-left: 10%;
  }
`;
