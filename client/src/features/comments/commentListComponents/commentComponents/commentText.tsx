import React, { useState } from "react";
import { StyledButton } from "./commentText.style";

interface IProp {
  text: string;
}

const CommentText = ({ text }: IProp) => {
  const [showMore, setShowMore] = useState(false);

  const showPartialText = () => {
    return (
      <div style={{ width: "46vw", minWidth: "205px" }}>
        {text.substring(0, 380)}{" "}
        {text.length > 380 ? (
          <StyledButton variant="link" onClick={() => setShowMore(true)}>
            <b>show more...</b>
          </StyledButton>
        ) : null}
      </div>
    );
  };

  const showAllText = () => {
    return (
      <div style={{ width: "46vw", minWidth: "205px" }}>
        {text}{" "}
        <StyledButton variant="link" onClick={() => setShowMore(false)}>
          <b>show less</b>
        </StyledButton>
      </div>
    );
  };

  return (
    <span className="mb-2" style={{ marginTop: "-2px" }}>
      {showMore ? showAllText() : showPartialText()}
    </span>
  );
};

export default CommentText;
