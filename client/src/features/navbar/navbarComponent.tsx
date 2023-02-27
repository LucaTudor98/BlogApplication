import React from "react";
import { Container } from "reactstrap";
import { Navbar, Nav } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Users } from "../users/usersPage";
import { Posts } from "../posts/postsComponent";
import { SinglePostPage } from "../posts/singlePostPage";
import { AddPostPage } from "../posts/addPostForm";
import { EditPostForm } from "../posts/editPostForm";
import AddUser from "../users/addUserPage";
import EditUser from "../users/editUserPage";
import { LoginForm } from "../login/loginForm";
import { useAppSelector } from "../../store/hooks";
import { UserDropDownMenu } from "./userDropDownMenu";
import { StyledBrand } from "./style/navbar";
import { SingleUserPage } from "../users/singleUserPage";
import { CustomError } from "../error/customError";

export const NavbarComponent = () => {
  const loggedIn = useAppSelector((state) => state.auth.isUserLoggedIn);
  const isAdmin = useAppSelector((state) => state.auth.userData.isAdmin);

  return (
    <Router>
      <div>
        <Navbar collapseOnSelect expand="sm" bg="dark" variant="dark">
          <Container>
            <StyledBrand as={Link} to={"/posts"}>
              Blue Team
            </StyledBrand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to={"/posts"}>
                  Posts
                </Nav.Link>{" "}
                {isAdmin ? (
                  <>
                    <Nav.Link as={Link} to={"/users"}>
                      Users
                    </Nav.Link>
                  </>
                ) : null}
                <Nav.Link as={Link} to={"/posts/createPost"}>
                  Create Post
                </Nav.Link>
              </Nav>
              {loggedIn ? (
                <UserDropDownMenu />
              ) : (
                <Nav className="justify-content-end">
                  <Nav.Link as={Link} to={"/login"}>
                    Log In
                  </Nav.Link>
                  <Nav.Link as={Link} to={"/users/addUser"}>
                    Register
                  </Nav.Link>
                </Nav>
              )}
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
      <div>
        <Routes>
          <Route path={"/"} element={<Posts />} />
          <Route path={"/users"} element={<Users />} />
          <Route path={"/posts"} element={<Posts />} />
          <Route path={"/posts/:postId"} element={<SinglePostPage />} />
          <Route
            path={"/posts/createPost"}
            element={<AddPostPage isLoggedIn={loggedIn} />}
          />
          <Route
            path={"/users/addUser"}
            element={<AddUser isAdmin={isAdmin} />}
          />
          <Route path={"/users/editUser/:id"} element={<EditUser />} />
          <Route path={"/login"} element={<LoginForm />} />
          <Route path={"/users/:userId"} element={<SingleUserPage />} />
          <Route path={"/posts/editPost/:postId"} element={<EditPostForm />} />
          <Route
            path={"/403"}
            element={
              <CustomError
                message={
                  "You shall not pass 🧙... you don't have permission to access this resource"
                }
                statusCode={403}
              />
            }
          />
          <Route
            path={"/500"}
            element={
              <CustomError
                message={
                  "Sorry but we couldn't perform your task, It's not you, It's us... Our server is down, try again later..."
                }
                statusCode={500}
              />
            }
          />
          <Route
            path={"/*"}
            element={
              <CustomError
                message={"The page you requested was not found..."}
                statusCode={404}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};
