import styled from "styled-components";
import { Row, Form, Col } from "react-bootstrap";

interface Iprop {
  as: string;
  placeholder: string;
  type: string;
  onChange: any;
}

export const StyledRow = styled(Row)`
  padding-left: 1.8em;
  padding-bottom: 0.2em;
  text-align: justify;
  text-decoration: none;
  padding-right: 2em;
`;

export const StyledColum = styled(Col)`
  text-align: left;
  padding-top: 19px;
  min-width: 180px;
  width: 45vw;
`;

export const SFormControl = styled(Form.Control)<Iprop>`
  ${(props) =>
    props.as &&
    props.placeholder &&
    props.type &&
    props.onChange &&
    ` 
  margin-left: 60px;
  border: none;
  border-bottom: 1px solid darkgrey;
  outline: none;
  width: 40vw;
  min-width: 200px;
  `}
`;
