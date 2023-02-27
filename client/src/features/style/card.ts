import styled from "styled-components";
import { Card } from "react-bootstrap";

export const StyledCard = styled(Card)`
  margin-bottom: 1.5em;
  box-shadow: -10px 10px 15px;

  &: hover {
    transform: scale(1.1);
    .postImage {
      opacity: 1;
    }
  }
`;
