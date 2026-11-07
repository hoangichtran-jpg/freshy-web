import React from "react";
import PropTypes from "prop-types";

import "./ManagementPageHeader.scss";

function ManagementPageHeader({ title, description, actions, className }) {
  const classes = ["management-page-header", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="management-page-header__intro">
        <h1 className="management-page-header__title">{title}</h1>

        {description ? (
          <p className="management-page-header__description">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="management-page-header__actions">{actions}</div>
      ) : null}
    </div>
  );
}

ManagementPageHeader.propTypes = {
  title: PropTypes.string.isRequired,

  description: PropTypes.string,

  actions: PropTypes.node,

  className: PropTypes.string,
};

ManagementPageHeader.defaultProps = {
  description: "",
  actions: null,
  className: "",
};

export default ManagementPageHeader;
