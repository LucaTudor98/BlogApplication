import React, { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";

import { Row } from "react-bootstrap";
import { HoverDiv } from "../users.styles";
import UserCard from "./userListComponents/userCard";
import Loading from "./userListComponents/loading";
import { useNavigate } from "react-router-dom";
import { IUser } from "../iUserTypes";

interface IProps {
  changePage: (number: number) => void;
  users: IUser[];
  hasPrevious: boolean;
  status: string;
}

const List = ({ changePage, users, hasPrevious, status }: IProps) => {
  const authState = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!authState.isUserLoggedIn) {
      navigate("/login");
    }

    if (Object.keys(authState.userData).length === 0) {
      return;
    }

    if (!authState.userData.isAdmin) {
      navigate("/403");
      return;
    }
  }, [authState.isUserLoggedIn, authState.userData, dispatch, navigate]);

  useEffect(() => {
    if (users.length < 1 && hasPrevious) {
      changePage(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="m-3 g-3 ">
      {users.map((user) => {
        return (
          <HoverDiv data-testid={user.id} key={user.id}>
            <UserCard {...user} key={user.id} />
          </HoverDiv>
        );
      })}
    </Row>
  );
};

export default List;
