import React, { forwardRef } from "react";

import PropTypes from "prop-types";

import { SearchOutlined } from "@ant-design/icons";

import AppInput from "../AppInput";

import "./SearchInput.scss";

const SEARCH_INPUT_SIZES = ["sm", "md", "lg"];

const SearchInput = forwardRef(function SearchInput(
  {
    size = "md",
    allowClear = true,
    className = "",
    prefix,
    ...inputProps
  },
  ref,
) {
  const classes = ["search-input", `search-input--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <AppInput
      {...inputProps}
      ref={ref}
      size={size}
      allowClear={allowClear}
      prefix={prefix ?? <SearchOutlined />}
      className={classes}
    />
  );
});

SearchInput.propTypes = {
  size: PropTypes.oneOf(SEARCH_INPUT_SIZES),
  allowClear: PropTypes.bool,
  className: PropTypes.string,
  prefix: PropTypes.node,
};

export default SearchInput;
