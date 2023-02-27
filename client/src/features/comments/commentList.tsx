import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useState } from "react";
import {
  getCommentsFromPost,
  getTopCommentsFromPost,
} from "../../store/slices/commentsSlice";

import Comment from "./commentListComponents/comment";
import AddComment from "./commentListComponents/commentComponents/addComment";
import { SContainer, StyledDiv } from "./commentList.styles";
import Search from "./../reusable/search";

import { ICommentGetAll } from "./iCommentTypes";

interface Iprop {
  postId: number;
}

const CommentsList = ({ postId }: Iprop) => {
  const directPostComments = useAppSelector(
    (state) => state.comments.comments
  ).result;
  const isLoggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const hasNext = useAppSelector((state) => state.comments.comments).hasNext;

  const [name, setName] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const showMoreComments = async (commentsLength: number) => {
    if (hasNext) {
      commentsLength += 5;
      fetchComments(commentsLength);
    }
  };

  const fetchComments = async (limit: number) => {
    if (name === "") {
      dispatch(
        getTopCommentsFromPost({
          postId,
          page: 1,
          limit: limit,
        } as ICommentGetAll)
      )
        .unwrap()
        .catch(() => navigate("/500"));

      return;
    }

    dispatch(
      getCommentsFromPost({ postId: postId, name: name, page: 1, limit: limit })
    )
      .unwrap()
      .catch(() => navigate("/500"));
  };

  let searchProps = {
    value: name,
    getComments: () => fetchComments(5),
    setValue: setName,
  };

  return (
    <SContainer>
      <Search {...searchProps} />
      {isLoggedIn ? <AddComment postId={postId} /> : null}
      {directPostComments.map((comment) => {
        return <Comment {...comment} key={comment.id} />;
      })}

      {hasNext ? (
        <StyledDiv onClick={() => showMoreComments(directPostComments.length)}>
          Show more comments
        </StyledDiv>
      ) : null}
    </SContainer>
  );
};

export default CommentsList;
