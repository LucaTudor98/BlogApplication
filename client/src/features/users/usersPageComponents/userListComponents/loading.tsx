import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = () => {
  return (
    <Spinner
      className="m-3"
      animation="border"
      role="status"
      data-testid="loadingSpinner"
    >
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
};

export default Loading;
