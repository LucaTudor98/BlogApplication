import styled from "styled-components";
import { Link } from "react-router-dom";

export const StyledLink = styled(Link)`
  text-align: left;
  margin-left: 10%;
  margin-right: 10%;
  display: block;
  text-decoration: none;
  color: black;
  &:hover {
    color: DarkSlateGray;
  }
`;
