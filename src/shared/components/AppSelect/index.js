import React, { forwardRef } from "react";

import PropTypes from "prop-types";

import { Select } from "antd";

import "./AppSelect.scss";

const APP_SELECT_SIZES = ["sm", "md", "lg"];

const AppSelect = forwardRef(function AppSelect(
  {
    size = "md",
    width,
    className = "",
    popupClassName = "",
    style,
    ...selectProps
  },
  ref,
) {
  const classes = ["app-select", `app-select--${size}`, className]
    .filter(Boolean)
    .join(" ");

  const popupClasses = ["app-select-dropdown", popupClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <Select
      {...selectProps}
      ref={ref}
      className={classes}
      popupClassName={popupClasses}
      style={{
        ...style,
        ...(width !== undefined ? { width } : {}),
      }}
    />
  );
});

AppSelect.propTypes = {
  size: PropTypes.oneOf(APP_SELECT_SIZES),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  popupClassName: PropTypes.string,
  style: PropTypes.object,
};

export default AppSelect;
