import styled from "styled-components";
import { Card } from "react-bootstrap";

export const Title = styled.h2`
  margin-top: 0.6em;
  margin-bottom: 0.9em;
  font-size: 2.5em;
  font-weight: bold;
  text-align: center;
  color: DarkSlateGray;
`;

export const CardTitle = styled(Card.Title)`
  text-align: left;
  font-weight: bold;
  padding-left: 0.5em;
  font-size: 2em;
  color: DarkSlateGray;
`;
