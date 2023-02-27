import styled from "styled-components";
import { Form } from "react-bootstrap";

export const STransparentButton = styled.button`
  padding: 0px;
  border: transparent;
  background-color: transparent;
`;

export const SForm = styled(Form.Control)`
  width: 40vw;
  min-width: 200px;
  max-width: 500px;
  display: inline-block;
`;

export const SFormContainer = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
`;
