import { Modal, Button } from "react-bootstrap";

interface IProps {
  title: string;
  content: string;
  show: boolean;
  onConfirmation: () => void;
  handleClose: () => void;
}

export const ModalComponent = (props: IProps) => {
  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{props.content}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-danger" onClick={props.onConfirmation}>
          Yes
        </Button>
        <Button variant="dark" onClick={props.handleClose}>
          No
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
