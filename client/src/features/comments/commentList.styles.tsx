import styled from "styled-components";
import { Container } from "react-bootstrap";

export const SContainer = styled(Container)`
  max-width: 70vw;
  min-width: 320px;
`;

export const StyledDiv = styled.div`
  font-size: 0.9em;
  font-style: italic;
  text-decoration: underline;
  margin-right: 68%;
  margin-bottom: 2%;
  margin-top: 1%;

  :hover {
    cursor: pointer;
  }
`;
