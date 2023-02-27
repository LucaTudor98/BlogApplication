/* eslint-disable react-hooks/exhaustive-deps */
import React, { useLayoutEffect } from "react";
import Reply from "./replyListComponents/reply";
import IComment from "../../iCommentTypes";
import { StyledContainer } from "./replyList.styles";

interface IProp {
  replies?: IComment[];
  setDisplayReplies: () => void;
}

const RepliesList = ({ replies, setDisplayReplies }: IProp) => {
  useLayoutEffect(() => {
    return () => {
      setDisplayReplies();
    };
  }, []);

  return (
    <StyledContainer>
      {replies
        ? replies.map((reply) => {
            return <Reply {...reply} key={reply.id} />;
          })
        : null}
    </StyledContainer>
  );
};

export default RepliesList;
