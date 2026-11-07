import React, { forwardRef } from "react";

import PropTypes from "prop-types";

import { Input } from "antd";

import "./AppInput.scss";

const APP_INPUT_SIZES = ["sm", "md", "lg"];

const buildClassName = (baseClassName, size, className) =>
  [baseClassName, `${baseClassName}--${size}`, className]
    .filter(Boolean)
    .join(" ");

const AppInput = forwardRef(function AppInput(
  { size = "md", className = "", ...inputProps },
  ref,
) {
  return (
    <Input
      {...inputProps}
      ref={ref}
      className={buildClassName("app-input", size, className)}
    />
  );
});

const AppPasswordInput = forwardRef(function AppPasswordInput(
  { size = "md", className = "", ...inputProps },
  ref,
) {
  return (
    <Input.Password
      {...inputProps}
      ref={ref}
      className={buildClassName("app-input", size, className)}
    />
  );
});

const AppTextArea = forwardRef(function AppTextArea(
  { size = "md", className = "", ...inputProps },
  ref,
) {
  return (
    <Input.TextArea
      {...inputProps}
      ref={ref}
      className={buildClassName("app-textarea", size, className)}
    />
  );
});

const commonPropTypes = {
  size: PropTypes.oneOf(APP_INPUT_SIZES),
  className: PropTypes.string,
};

AppInput.propTypes = commonPropTypes;
AppPasswordInput.propTypes = commonPropTypes;
AppTextArea.propTypes = commonPropTypes;

AppInput.Password = AppPasswordInput;
AppInput.TextArea = AppTextArea;

export default AppInput;
