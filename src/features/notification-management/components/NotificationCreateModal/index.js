import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";

import AppSelect from "../../../../shared/components/AppSelect";

import { TeamOutlined } from "@ant-design/icons";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";
import AppInput from "../../../../shared/components/AppInput";

import {
  DEFAULT_NOTIFICATION_AUDIENCE,
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_AUDIENCE_OPTIONS,
} from "../../constants";

import "./NotificationCreateModal.scss";

const createInitialForm = () => ({
  audience: DEFAULT_NOTIFICATION_AUDIENCE,

  title: "",

  body: "",
});

function NotificationCreateModal({
  open,

  submitting,

  onCancel,

  onSubmit,
}) {
  /* ========================================
     Form
  ======================================== */

  const [form, setForm] = useState(createInitialForm);

  /* ========================================
     Reset

     Mỗi lần modal đóng:
     form quay về trạng thái sạch.

     Không giữ draft ngầm giữa các lần mở.
  ======================================== */

  useEffect(() => {
    if (!open) {
      setForm(createInitialForm());
    }
  }, [open]);

  /* ========================================
     Derived
  ======================================== */

  const normalizedTitle = form.title.trim();

  const normalizedBody = form.body.trim();

  const canSubmit =
    Boolean(normalizedTitle) && Boolean(normalizedBody) && !submitting;

  const isBroadcast = form.audience === NOTIFICATION_AUDIENCE.ALL;

  /* ========================================
     Change handlers
  ======================================== */

  const handleAudienceChange = (value) => {
    setForm((previous) => ({
      ...previous,

      audience: value,
    }));
  };

  const handleTitleChange = (event) => {
    setForm((previous) => ({
      ...previous,

      title: event.target.value,
    }));
  };

  const handleBodyChange = (event) => {
    setForm((previous) => ({
      ...previous,

      body: event.target.value,
    }));
  };

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      audience: form.audience,

      title: normalizedTitle,

      body: normalizedBody,
    });
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementFormModal
      open={open}
      width={680}
      title="Tạo thông báo"
      description="Soạn nội dung và gửi ngay tới nhóm người nhận đã chọn."
      loading={submitting}
      primaryText="Gửi thông báo"
      primaryDisabled={!canSubmit}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="notification-create-modal">
        {/* ========================================
            Audience
        ======================================== */}

        <section className="notification-create-modal__section">
          <div className="notification-create-modal__section-heading">
            <span>Người nhận</span>

            <p>Chọn nhóm người dùng sẽ nhận thông báo này.</p>
          </div>

          <div className="notification-create-modal__field">
            <label
              htmlFor="notification-audience"
              className="notification-create-modal__label"
            >
              Nhóm người nhận
              <span aria-hidden="true">*</span>
            </label>

            <AppSelect
              size="md"
              id="notification-audience"
              value={form.audience}
              disabled={submitting}
              options={NOTIFICATION_AUDIENCE_OPTIONS}
              className="notification-create-modal__select"
              suffixIcon={<TeamOutlined />}
              onChange={handleAudienceChange}
            />

            {isBroadcast ? (
              <div className="notification-create-modal__broadcast-note">
                Thông báo này sẽ được gửi tới toàn bộ hệ thống.
              </div>
            ) : null}
          </div>
        </section>

        {/* ========================================
            Content
        ======================================== */}

        <section className="notification-create-modal__section">
          <div className="notification-create-modal__section-heading">
            <span>Nội dung</span>

            <p>
              Viết ngắn gọn và rõ ràng để người nhận hiểu ngay thông tin chính.
            </p>
          </div>

          <div className="notification-create-modal__fields">
            <div className="notification-create-modal__field">
              <label
                htmlFor="notification-title"
                className="notification-create-modal__label"
              >
                Tiêu đề
                <span aria-hidden="true">*</span>
              </label>

              <AppInput
                id="notification-title"
                value={form.title}
                disabled={submitting}
                placeholder="Ví dụ: Thông báo thay đổi thời gian phục vụ"
                onChange={handleTitleChange}
              />
            </div>

            <div className="notification-create-modal__field">
              <label
                htmlFor="notification-body"
                className="notification-create-modal__label"
              >
                Nội dung thông báo
                <span aria-hidden="true">*</span>
              </label>

              <AppInput.TextArea
                id="notification-body"
                value={form.body}
                disabled={submitting}
                autoSize={{
                  minRows: 5,

                  maxRows: 9,
                }}
                placeholder="Nhập nội dung muốn gửi tới người dùng..."
                onChange={handleBodyChange}
              />

              <span className="notification-create-modal__helper">
                Thông báo hiện được gửi ngay sau khi xác nhận.
              </span>
            </div>
          </div>
        </section>
      </div>
    </ManagementFormModal>
  );
}

NotificationCreateModal.propTypes = {
  open: PropTypes.bool,

  submitting: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

NotificationCreateModal.defaultProps = {
  open: false,

  submitting: false,
};

export default NotificationCreateModal;
