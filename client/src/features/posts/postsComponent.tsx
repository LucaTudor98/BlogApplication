import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Container, Pagination } from "react-bootstrap";
import { Title } from "../style/title";
import { fetchPosts } from "../../store/slices/postsSlice";
import { selectAllPosts } from "../../store/slices/postsSlice";
import { useNavigate } from "react-router-dom";
import { LoadingComponent } from "../loading/loadingComponent";
import { PostsSearch } from "./postsSearchComponent";
import { PostsGetInput } from "./interfaces/IPost";
import { PostsList } from "./postsList";

export const Posts = () => {
  const posts = useAppSelector(selectAllPosts).result;
  const hasNext = useAppSelector(selectAllPosts).hasNext;
  const hasPrevious = useAppSelector(selectAllPosts).hasPrevious;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let search = urlParams.get("search");

  if (!search) {
    search = "";
  }

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const postStatus = useAppSelector((state) => state.posts.status);
  const loading = useAppSelector((state) => state.posts.loading);
  const [page, setPage] = useState(1);

  const showPosts = async (increment: number) => {
    const sentState = await dispatch(
      fetchPosts({
        page: page + increment,
        limit: 5,
        search: search as string,
      } as PostsGetInput)
    );

    if (sentState.meta.requestStatus === "fulfilled") {
      setPage(page + increment);
    }
  };

  useEffect(() => {
    dispatch(
      fetchPosts({
        page: 1,
        limit: 5,
        search: search as string,
      } as PostsGetInput)
    )
      .unwrap()
      .catch(() => navigate("/500"));
  }, [dispatch, navigate, postStatus, search]);

  useEffect(() => {
    if (!hasPrevious) {
      setPage(1);
    }
  }, [hasPrevious]);

  return loading ? (
    <LoadingComponent />
  ) : (
    <Container>
      <Title>Posts</Title>
      <PostsSearch />
      <PostsList status={postStatus} posts={posts} />
      <Pagination className="m-3" style={{ justifyContent: "center" }}>
        <Pagination.Prev
          disabled={!hasPrevious}
          onClick={() => showPosts(-1)}
        />
        <Pagination.Item active>{page}</Pagination.Item>
        <Pagination.Next disabled={!hasNext} onClick={() => showPosts(1)} />
      </Pagination>
    </Container>
  );
};
