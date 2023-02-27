import styled from "styled-components";
import { Image } from "react-bootstrap";

export const StyledImage = styled(Image)`
  margin-top: 3%;
  height: 400px;
  max-width: 100%;
`;

export const PostViewImage = styled(Image)`
  margin-top: 1%;
  margin-bottom: 1%;
  height: 500px;
  max-width: 100%;
`;

export const CardImage = styled(Image)`
  margin-left: 2%;
  margin-top: 10px;
  margin-bottom: 30px;
  opacity: 0.6;
  width: 25%;

  @media (max-width: 991px) {
    width: 40%;
    margin-left: 3%;
  }

  @media (max-width: 767px) {
    width: 60%;
    margin-left: 5%;
  }
`;
