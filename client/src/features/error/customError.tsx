import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface IProp {
  statusCode: number;
  message: string;
}

export const CustomError = ({ statusCode, message }: IProp) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="m-3"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "40vh",
        }}
      >
        <h1
          style={{
            borderRight: "1px solid grey",
            padding: "10px",
            display: "inline-block",
          }}
        >
          {statusCode}
        </h1>
        <h2
          className="font-weight-normal lead"
          id="desc"
          style={{ padding: "10px", display: "inline-block" }}
        >
          {message}
        </h2>
      </div>
      <Button variant="dark" onClick={() => navigate("/posts")}>
        Home page
      </Button>
      {statusCode === 500 ? (
        <Button className="m-3" variant="dark" onClick={() => navigate(-1)}>
          Previous page
        </Button>
      ) : null}
    </>
  );
};
