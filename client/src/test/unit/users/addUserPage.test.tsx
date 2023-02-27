import React from "react";
import { render, screen } from "../../../utils/test-utils";
import AddUser from "../../../features/users/addUserPage";
import userEvent from "@testing-library/user-event";

test("renders the addUserComponent", async () => {
  render(<AddUser isAdmin={false} />);

  const userCard = screen.getByTitle("UserCard");
  const cancelButton = screen.getByTitle("Cancel");
  expect(userCard).toBeInTheDocument();
  expect(cancelButton).toBeInTheDocument();
});

test("confirm button is disabled when password is missing", async () => {
  render(<AddUser isAdmin={false} />);

  const nameInput = screen.getByTestId("name-input");
  const emailInput = screen.getByTestId("email-input");
  const confirmButton = screen.getByTitle("Confirm");

  userEvent.type(nameInput, "randomName");
  userEvent.type(emailInput, "random@gmail.com");

  expect(confirmButton).toBeDisabled();
});

test("confirm button is disabled when email is missing", async () => {
  render(<AddUser isAdmin={false} />);

  const nameInput = screen.getByTestId("name-input");
  const passwordInput = screen.getByTestId("password-input");
  const confirmButton = screen.getByTitle("Confirm");

  userEvent.type(nameInput, "randomName");
  userEvent.type(passwordInput, "pasas");

  expect(confirmButton).toBeDisabled();
});

test("confirm button is disabled when name is missing", async () => {
  render(<AddUser isAdmin={false} />);

  const emailInput = screen.getByTestId("email-input");
  const passwordInput = screen.getByTestId("password-input");
  const confirmButton = screen.getByTitle("Confirm");

  userEvent.type(emailInput, "random@gmail.com");
  userEvent.type(passwordInput, "pasas");

  expect(confirmButton).toBeDisabled();
});

test("onSubmit is called when all fields pass validation", async () => {
  render(<AddUser isAdmin={false} />);

  const nameInput = screen.getByTestId("name-input");
  const emailInput = screen.getByTestId("email-input");
  const passwordInput = screen.getByTestId("password-input");
  const confirmButton = screen.getByTitle("Confirm");

  userEvent.type(nameInput, "randomName");
  userEvent.type(emailInput, "random@gmail.com");
  userEvent.type(passwordInput, "password");

  expect(confirmButton).toBeEnabled();
});

test("admin checkbox is not available for not logged in user", async () => {
  render(<AddUser isAdmin={false} />);
  expect(screen.queryByTestId("isAdmin-checkbox")).toBeNull();
});

test("admin checkbox is available for logged in admin user", async () => {
  render(<AddUser isAdmin={true} />);

  expect(screen.getByTestId("isAdmin-checkbox")).toBeInTheDocument();
});

test("admin checkbox is checked/unchecked on click", async () => {
  render(<AddUser isAdmin={true} />);

  const isAdminCheckBox = screen.getByTestId("isAdmin-checkbox");
  expect(isAdminCheckBox).not.toBeChecked();

  userEvent.click(isAdminCheckBox);
  expect(isAdminCheckBox).toBeChecked();

  userEvent.click(isAdminCheckBox);
  expect(isAdminCheckBox).not.toBeChecked();
});
