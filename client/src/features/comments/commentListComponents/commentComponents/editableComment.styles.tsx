import styled from "styled-components";
import { Form } from "react-bootstrap";

interface Iprop {
  as: string;
  ref?: any;
  type: string;
  onChange: any;
  placeholder: string;
}

export const SFormControl = styled(Form.Control)<Iprop>`
  border: none;
  border-bottom: 1px solid darkgrey;
  outline: none;
  width: 46vw;
  min-width: 205px;
  overflow-y: hidden;
`;
