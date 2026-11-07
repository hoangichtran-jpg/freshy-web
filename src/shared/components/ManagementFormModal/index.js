import React from "react";
import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../AppModal";

import AppButton from "../AppButton";

import "./ManagementFormModal.scss";


function ManagementFormModal({
  open,
  width,

  title,
  description,

  loading,
  primaryText,
  primaryDisabled,
  cancelText,

  children,

  onCancel,
  onSubmit,
}) {
  return (
    <AppModal
      open={open}
      width={width}
      footer={null}
      closable={!loading}
      maskClosable={false}
      keyboard={!loading}
      className="management-form-modal"
      onCancel={onCancel}
    >
      <div className="management-form-modal__layout">
        <header className="management-form-modal__header">
          <h2 className="management-form-modal__title">
            {title}
          </h2>

          {description ? (
            <p className="management-form-modal__description">
              {description}
            </p>
          ) : null}
        </header>


        <div className="management-form-modal__body">
          {children}
        </div>


        <footer className="management-form-modal__footer">
          <Button
            disabled={loading}
            className="management-form-modal__cancel"
            onClick={onCancel}
          >
            {cancelText}
          </Button>


          <AppButton
            loading={loading}
            disabled={primaryDisabled}
            onClick={onSubmit}
          >
            {primaryText}
          </AppButton>
        </footer>
      </div>
    </AppModal>
  );
}


ManagementFormModal.propTypes = {
  open:
    PropTypes.bool.isRequired,

  width:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  title:
    PropTypes.string.isRequired,

  description:
    PropTypes.string,

  loading:
    PropTypes.bool,

  primaryText:
    PropTypes.string.isRequired,

  primaryDisabled:
    PropTypes.bool,

  cancelText:
    PropTypes.string,

  children:
    PropTypes.node.isRequired,

  onCancel:
    PropTypes.func.isRequired,

  onSubmit:
    PropTypes.func.isRequired,
};


ManagementFormModal.defaultProps = {
  width:
    820,

  description:
    "",

  loading:
    false,

  primaryDisabled:
    false,

  cancelText:
    "Hủy",
};


export default ManagementFormModal;