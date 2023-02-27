import React, { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import { Modal, Button } from "react-bootstrap";

interface IProps {
  image: string;
  imageName: string;
  show: boolean;
  handleClose: () => void;
  setCroppedImage: (input: File) => void;
}

export const CroppedModal = ({
  image,
  imageName,
  show,
  setCroppedImage,
  handleClose,
}: IProps) => {
  const [zoom, setZoom] = useState(1);
  const editor = useRef<AvatarEditor>(null);

  const onCropped = () => {
    if (editor.current) {
      editor.current.getImageScaledToCanvas().toBlob((blob) => {
        setCroppedImage(new File([blob!], imageName));
      });
      handleClose();
    }
  };

  const setZoomOnWheel = (e: any) => {
    const minZoom = 1;
    const maxZoom = 3;
    const step = e.deltaY < 0 ? 0.1 : -0.1;

    setZoom(Math.max(minZoom, Math.min(maxZoom, zoom + step)));
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Select avatar</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          className="d-flex justify-content-center"
          style={{
            height: "250px",
          }}
          onWheel={setZoomOnWheel}
        >
          <AvatarEditor
            ref={editor}
            image={image}
            scale={zoom}
            borderRadius={100}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e) => setZoom(e.target.valueAsNumber)}
        ></input>
        <Button variant="outline-danger" onClick={onCropped}>
          Confirm
        </Button>
        <Button variant="dark" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
