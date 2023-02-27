import styled from "styled-components";
import { Form } from "react-bootstrap";

interface Iprop {
  ref?: any;
  as: string;
  type: string;
  rows?: number;
  onChange: any;
  placeholder: string;
}

export const SFormControl = styled(Form.Control)<Iprop>`
  resize: none;
  border: none;
  border-bottom: 1px solid darkgrey;
  outline: none;
  display: block;
  width: 51vw;
  min-width: 290px;
  overflow-y: hidden;
`;
