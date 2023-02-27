import React from "react";
import { render, screen } from "../../../utils/test-utils";
import List from "../../../features/users/usersPageComponents/userList";
import { IUser } from "../../../features/users/iUserTypes";
import UserCard from "../../../features/users/usersPageComponents/userListComponents/userCard";

const testUsers: IUser[] = [
  {
    id: 1,
    name: "random",
    email: "random@gmail.com",
    password: "",
    isAdmin: true,
    dateCreated: new Date(),
    dateModified: new Date(),
  },
  {
    id: 2,
    name: "random2",
    email: "random2@gmail.com",
    password: "",
    isAdmin: true,
    dateCreated: new Date(),
    dateModified: new Date(),
  },
];

test("renders the loading component", async () => {
  const mock = jest.fn();
  render(
    <List
      changePage={mock}
      users={testUsers}
      hasPrevious={false}
      status={"loading"}
    />
  );

  const loading = screen.getByTestId("loadingSpinner");
  expect(loading).toBeInTheDocument();
});

test("renders the listing component", async () => {
  const mock = jest.fn();
  render(
    <List changePage={mock} users={testUsers} hasPrevious={false} status={""} />
  );

  expect(screen.getByTestId("1")).toBeInTheDocument();
  expect(screen.getByTestId("2")).toBeInTheDocument();
});

test("hasPrevious and no listing users callsback changePage", async () => {
  const changePageMock = jest.fn();
  render(
    <List
      changePage={changePageMock}
      users={[]}
      hasPrevious={true}
      status={""}
    />
  );

  expect(changePageMock).toHaveBeenCalled();
});

test("UserCard renders the correct information", async () => {
  render(
    <UserCard
      id={testUsers[0].id}
      name={testUsers[0].name}
      email={testUsers[0].email}
      dateCreated={testUsers[0].dateCreated}
      dateModified={testUsers[0].dateModified}
    />
  );

  expect(screen.getByTestId("name")).toHaveTextContent("random");
  expect(screen.getByTestId("email")).toHaveTextContent("random@gmail.com");
});
