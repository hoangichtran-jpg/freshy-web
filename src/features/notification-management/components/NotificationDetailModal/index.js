import React from "react";

import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import {
  DeleteOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../shared/components/AppButton";

import { getNotificationAudienceLabel } from "../../constants";

import { formatNotificationSentAt } from "../../utils";

import "./NotificationDetailModal.scss";

function NotificationDetailModal({
  open,

  notification,

  resending,

  onClose,

  onResend,

  onDelete,
}) {
  if (!notification) {
    return null;
  }

  /* ========================================
     Derived
  ======================================== */

  const audienceLabel = getNotificationAudienceLabel(notification.audience);

  const sentAt = formatNotificationSentAt(notification.sentAt);

  /* ========================================
     Render
  ======================================== */

  return (
    <AppModal
      open={open}
      width={720}
      footer={null}
      title={null}
      closable={!resending}
      maskClosable={!resending}
      keyboard={!resending}
      className="notification-detail-modal"
      onCancel={onClose}
    >
      {/* ========================================
          Header
      ======================================== */}

      <header className="notification-detail-modal__header">
        <span className="notification-detail-modal__eyebrow">
          Lịch sử trên trình duyệt này
        </span>

        <h2 className="notification-detail-modal__title">Chi tiết thông báo</h2>

        <div className="notification-detail-modal__header-meta">
          <span className="notification-detail-modal__audience">
            {audienceLabel}
          </span>

          <span className="notification-detail-modal__sent-at">
            Đã gửi lúc <strong>{sentAt}</strong>
          </span>
        </div>
      </header>

      {/* ========================================
          Body
      ======================================== */}

      <div className="notification-detail-modal__body">
        {/* ========================================
            Content
        ======================================== */}

        <section className="notification-detail-modal__section">
          <div className="notification-detail-modal__section-heading">
            <span>Nội dung</span>

            <p>Nội dung đã được gửi trong lần gửi này.</p>
          </div>

          <div className="notification-detail-modal__content">
            <div className="notification-detail-modal__field">
              <span className="notification-detail-modal__label">Tiêu đề</span>

              <strong className="notification-detail-modal__message-title">
                {notification.title}
              </strong>
            </div>

            <div className="notification-detail-modal__field">
              <span className="notification-detail-modal__label">
                Nội dung thông báo
              </span>

              <p className="notification-detail-modal__message-body">
                {notification.body}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================
            Local history disclosure
        ======================================== */}

        <div className="notification-detail-modal__local-note">
          <InfoCircleOutlined />

          <div>
            <strong>Đây là lịch sử cục bộ</strong>

            <span>
              Bản ghi này chỉ được lưu trên trình duyệt hiện tại. Xóa bản ghi
              không thu hồi thông báo đã gửi tới người nhận.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================
          Footer
      ======================================== */}

      <footer className="notification-detail-modal__footer">
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={resending}
          className="notification-detail-modal__delete"
          onClick={() => {
            onDelete(notification);
          }}
        >
          Xóa khỏi lịch sử
        </Button>

        <AppButton
          icon={<SendOutlined />}
          loading={resending}
          onClick={() => {
            onResend(notification);
          }}
        >
          Gửi lại
        </AppButton>
      </footer>
    </AppModal>
  );
}

NotificationDetailModal.propTypes = {
  open: PropTypes.bool,

  notification: PropTypes.shape({
    clientId: PropTypes.string,

    audience: PropTypes.string,

    title: PropTypes.string,

    body: PropTypes.string,

    sentAt: PropTypes.string,
  }),

  resending: PropTypes.bool,

  onClose: PropTypes.func.isRequired,

  onResend: PropTypes.func.isRequired,

  onDelete: PropTypes.func.isRequired,
};

NotificationDetailModal.defaultProps = {
  open: false,

  notification: null,

  resending: false,
};

export default NotificationDetailModal;
