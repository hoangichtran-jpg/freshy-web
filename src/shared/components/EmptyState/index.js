import React from "react";

import PropTypes from "prop-types";

import { Empty } from "antd";

import "./EmptyState.scss";

function EmptyState({
  description,
  image,
  className = "",
  children,
  ...emptyProps
}) {
  const classes = ["empty-state", className]
    .filter(Boolean)
    .join(" ");

  const resolvedImage =
    image === "simple"
      ? Empty.PRESENTED_IMAGE_SIMPLE
      : image;

  return (
    <Empty
      {...emptyProps}
      className={classes}
      image={resolvedImage}
      description={description}
    >
      {children}
    </Empty>
  );
}

EmptyState.propTypes = {
  description: PropTypes.node,
  image: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  className: PropTypes.string,
  children: PropTypes.node,
};

EmptyState.defaultProps = {
  description: "Chưa có dữ liệu.",
  image: "simple",
  className: "",
  children: null,
};

export default EmptyState;
