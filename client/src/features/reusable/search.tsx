import React, { FormEvent } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faDeleteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { STransparentButton, SForm, SFormContainer } from "./search.styles";

interface IProp {
  value: string;
  getUsers?: (e: FormEvent) => void;
  getComments?: () => void;
  setValue: (value: string) => void;
}

const Search = ({ value, getComments, getUsers, setValue }: IProp) => {
  const onChangeInput = (e: FormEvent) => {
    setValue((e.target as HTMLInputElement).value);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (getUsers) {
      getUsers(e);
      return;
    }

    if (getComments) {
      getComments();
      return;
    }
  };

  const onCancel = (e: FormEvent) => {
    setValue("");
  };

  return (
    <div className="m-1">
      <SFormContainer onSubmit={(e) => onSubmit(e)}>
        <SForm
          className="m-2 m-sm-2"
          placeholder="Name..."
          type="text"
          onChange={onChangeInput}
          value={value}
        />
        <STransparentButton
          className="m-sm-2"
          data-toggle="tooltip"
          data-placement="right"
          title="Search"
          type="submit"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" />
        </STransparentButton>
        <STransparentButton
          className="m-2 m-sm-2"
          data-toggle="tooltip"
          data-placement="right"
          title="Clear"
          onClick={onCancel}
        >
          <FontAwesomeIcon icon={faDeleteLeft} size="2x" />
        </STransparentButton>
      </SFormContainer>
    </div>
  );
};

export default Search;
