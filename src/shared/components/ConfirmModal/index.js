import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../AppModal";

import "./ConfirmModal.scss";


function ConfirmModal({
  open,
  title,
  description,
  children,
  confirmText,
  cancelText,
  danger,
  loading,
  onConfirm,
  onCancel,
}) {
  return (
    <AppModal
      open={open}
      width={420}
      footer={null}
      closable={false}
      maskClosable={!loading}
      keyboard={!loading}
      className="confirm-modal"
      onCancel={onCancel}
    >
      <div className="confirm-modal__header">
        {title}
      </div>

      <div className="confirm-modal__body">
        {children || (
          <div className="confirm-modal__description">
            {description}
          </div>
        )}
      </div>

      <div className="confirm-modal__footer">
        <Button
          className="confirm-modal__button confirm-modal__button--cancel"
          disabled={loading}
          onClick={onCancel}
        >
          {cancelText}
        </Button>

        <Button
          type="primary"
          danger={danger}
          loading={loading}
          className="confirm-modal__button confirm-modal__button--confirm"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </AppModal>
  );
}


ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,

  title: PropTypes.node,

  description: PropTypes.node,

  children: PropTypes.node,

  confirmText: PropTypes.node,

  cancelText: PropTypes.node,

  danger: PropTypes.bool,

  loading: PropTypes.bool,

  onConfirm: PropTypes.func.isRequired,

  onCancel: PropTypes.func.isRequired,
};


ConfirmModal.defaultProps = {
  title: "Thông báo",

  description: null,

  children: null,

  confirmText: "Xác nhận",

  cancelText: "Hủy",

  danger: false,

  loading: false,
};


export default ConfirmModal;