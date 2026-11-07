import React, { forwardRef } from "react";

import PropTypes from "prop-types";

import { InputNumber } from "antd";

import "./AppInputNumber.scss";

const APP_INPUT_NUMBER_SIZES = ["sm", "md", "lg"];

const buildClassName = (size, className) =>
  ["app-input-number", `app-input-number--${size}`, className]
    .filter(Boolean)
    .join(" ");

const AppInputNumber = forwardRef(function AppInputNumber(
  { size = "md", className = "", ...inputNumberProps },
  ref,
) {
  return (
    <InputNumber
      {...inputNumberProps}
      ref={ref}
      className={buildClassName(size, className)}
    />
  );
});

AppInputNumber.propTypes = {
  size: PropTypes.oneOf(APP_INPUT_NUMBER_SIZES),
  className: PropTypes.string,
};

export default AppInputNumber;
