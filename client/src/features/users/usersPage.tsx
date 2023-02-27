import Add from "./usersPageComponents/addUser";
import List from "./usersPageComponents/userList";
import { CenteredModal } from "../popup/CenteredModal";
import { LoadingComponent } from "../loading/loadingComponent";

import { useNavigate } from "react-router-dom";
import { useState, FormEvent, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { getUsers } from "../../store/slices/usersSlice";

import { Pagination } from "react-bootstrap";
import Search from "../reusable/search";
import { store } from "../../store/store";

export const Users = () => {
  const defaultLimit = 8;
  const [showServerErrorPopup, setShowServerErrorPopup] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const isAdmin = useAppSelector((state) => state.auth.userData.isAdmin);
  const hasNext = useAppSelector((state) => state.users.users.hasNext);
  const hasPrevious = useAppSelector((state) => state.users.users.hasPrevious);
  const usersState = useAppSelector((state) => state.users);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [paginationSearch, setPaginationSearch] = useState(name);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getUsers({ page: 1, limit: defaultLimit, name: "" }))
      .unwrap()
      .catch(() => {
        const statusError = parseInt(store.getState().users.error, 10);
        if (statusError === 403) {
          navigate("/403");
        } else {
          navigate("/500");
        }
      });
  }, [dispatch, navigate]);

  const fetchUser = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sentState = await dispatch(
      getUsers({ page: 1, limit: defaultLimit, name: name })
    );

    if (sentState.meta.requestStatus === "fulfilled") {
      setPage(1);
      setPaginationSearch(name);
    }
  };

  const showUsers = async (increment: number) => {
    const sentState = await dispatch(
      getUsers({
        page: page + increment,
        limit: defaultLimit,
        name: paginationSearch,
      })
    );

    if (sentState.meta.requestStatus === "fulfilled") {
      setPage(page + increment);
    }
  };

  let searchProps = {
    value: name,
    getUsers: fetchUser,
    setValue: setName,
  };

  let listProps = {
    changePage: showUsers,
  };

  return usersState.status === "Loading" ? (
    <LoadingComponent />
  ) : (
    <div>
      {isLoggedIn ? null : <Add />}
      {isAdmin ? (
        <>
          <Add />
          <Search {...searchProps} />
          <List
            hasPrevious={usersState.users.hasPrevious}
            status={usersState.status}
            users={usersState.users.result}
            {...listProps}
          />
        </>
      ) : null}
      <Pagination className="m-3" style={{ justifyContent: "center" }}>
        <Pagination.Prev
          disabled={!hasPrevious}
          onClick={() => showUsers(-1)}
        />
        <Pagination.Item active>{page}</Pagination.Item>
        <Pagination.Next disabled={!hasNext} onClick={() => showUsers(1)} />
      </Pagination>
      <CenteredModal
        show={showServerErrorPopup}
        onHide={() => setShowServerErrorPopup(false)}
        content={
          "500 | Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
        }
      />
    </div>
  );
};
