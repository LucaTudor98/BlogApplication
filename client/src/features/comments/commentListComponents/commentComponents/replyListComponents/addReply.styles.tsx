import styled from "styled-components";
import { Form } from "react-bootstrap";

interface Iprop {
  ref?: any;
  as: string;
  placeholder: string;
  type: string;
  onChange: any;
}

export const SFormControl = styled(Form.Control)<Iprop>`
  resize: none;
  border: none;
  border-bottom: 1px solid darkgrey;
  outline: none;
  display: block;
  width: 38vw;
  min-width: 255px;
  max-width: 450px;
  margin-left: 27px;
  overflow-y: hidden;
`;
