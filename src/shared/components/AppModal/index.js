import React from "react";
import PropTypes from "prop-types";

import { Modal } from "antd";

import "./AppModal.scss";

function AppModal({
  className,
  centered,
  destroyOnClose,
  ...modalProps
}) {
  const classes = ["app-modal", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Modal
      {...modalProps}
      centered={centered}
      destroyOnClose={destroyOnClose}
      className={classes}
    />
  );
}

AppModal.propTypes = {
  className: PropTypes.string,
  centered: PropTypes.bool,
  destroyOnClose: PropTypes.bool,
};

AppModal.defaultProps = {
  className: "",
  centered: true,
  destroyOnClose: true,
};

export default AppModal;
