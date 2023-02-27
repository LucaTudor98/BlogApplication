import { Modal, Button } from "react-bootstrap";

interface IProps {
  show: boolean;
  onHide: () => void;
  content: string;
}

export const CenteredModal = (props: IProps) => {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.content}
        </Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button variant="outline-dark" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
