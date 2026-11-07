import React from "react";
import PropTypes from "prop-types";

import { Button } from "antd";

import "./AppButton.scss";

const APP_BUTTON_VARIANTS = ["primary", "secondary", "danger", "ghost"];

const APP_BUTTON_SIZES = ["sm", "md", "lg"];

function AppButton({
  children,
  variant,
  size,
  icon,
  loading,
  disabled,
  className,
  ...buttonProps
}) {
  const classes = [
    "app-button",
    `app-button--${variant}`,
    `app-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Button
      {...buttonProps}
      type="default"
      icon={icon}
      loading={loading}
      disabled={disabled || loading}
      className={classes}
    >
      {children}
    </Button>
  );
}

AppButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(APP_BUTTON_VARIANTS),
  size: PropTypes.oneOf(APP_BUTTON_SIZES),
  icon: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

AppButton.defaultProps = {
  children: null,
  variant: "primary",
  size: "md",
  icon: null,
  loading: false,
  disabled: false,
  className: "",
};

export default AppButton;
