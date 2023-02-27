import React, { useState, FormEvent } from "react";

import {
  faMagnifyingGlass,
  faDeleteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { ClearButton, SearchButton, SearchFontAwesome } from "../style/buttons";
import { StyledFormSearch } from "../style/form";
import { fetchPosts } from "../../store/slices/postsSlice";
import { useAppThunkDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const PostsSearch = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let srch = urlParams.get("search");
  if (!srch) {
    srch = "";
  }

  const [search, setSearch] = useState(srch);
  const navigate = useNavigate();
  const dispatch = useAppThunkDispatch();

  const onChangeInput = (e: FormEvent) => {
    setSearch((e.target as HTMLInputElement).value);
  };

  const SearchPostsClicked = async () => {
    navigate(`/posts?search=${search}`);
    dispatch(fetchPosts({ page: 1, limit: 5, search: search }))
      .unwrap()
      .catch(() => navigate("/500"));
  };

  const ClearSearchClicked = async () => {
    setSearch("");
    navigate("/posts");
  };

  return (
    <div className="m-3">
      <Form>
        <StyledFormSearch
          placeholder="Search.."
          type="text"
          onChange={onChangeInput}
          value={search}
        />
        <SearchButton variant="Dark" type="submit" onClick={SearchPostsClicked}>
          <SearchFontAwesome icon={faMagnifyingGlass} size="2x" />
        </SearchButton>
        <ClearButton variant="Dark" onClick={ClearSearchClicked}>
          <FontAwesomeIcon icon={faDeleteLeft} size="2x" />
        </ClearButton>
      </Form>
    </div>
  );
};
