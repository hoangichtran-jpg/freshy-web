import React from "react";
import PropTypes from "prop-types";



import { CalendarOutlined, PictureOutlined } from "@ant-design/icons";

import "./BannerPreviewModal.scss";

import AppModal from "../../../../shared/components/AppModal";

/* ========================================
   Helpers
======================================== */

const formatDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("vi-VN");
};

/* ========================================
   Component
======================================== */

function BannerPreviewModal({ open, banner, onClose }) {
  if (!banner) {
    return null;
  }

  const createdDate = formatDate(banner.createdDate);

  return (
    <AppModal
      open={open}
      width={760}
      footer={null}
      className="banner-preview-modal"
      title={null}
      onCancel={onClose}
    >
      {/* ========================================
          Header
      ======================================== */}

      <div className="banner-preview-modal__header">
        <span className="banner-preview-modal__eyebrow">
          Xem trước quảng cáo
        </span>

        <div className="banner-preview-modal__heading">
          <div className="banner-preview-modal__title-group">
            <h2 className="banner-preview-modal__title">
              {banner.title || "Chưa có tiêu đề"}
            </h2>

            <span
              className={[
                "banner-preview-modal__status",
                banner.active
                  ? "banner-preview-modal__status--active"
                  : "banner-preview-modal__status--inactive",
              ].join(" ")}
            >
              <span
                className="banner-preview-modal__status-dot"
                aria-hidden="true"
              />

              {banner.active ? "Đang hiển thị" : "Đang ẩn"}
            </span>
          </div>

          <div className="banner-preview-modal__meta">
            <span>
              <PictureOutlined />
              Thứ tự #{banner.sortOrder ?? 0}
            </span>

            {createdDate ? (
              <span>
                <CalendarOutlined />

                {createdDate}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ========================================
          Preview
      ======================================== */}

      <div className="banner-preview-modal__content">
        <div className="banner-preview-modal__canvas">
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.title || "Banner quảng cáo"}
              className="banner-preview-modal__image"
            />
          ) : (
            <div className="banner-preview-modal__empty">
              <PictureOutlined />

              <span>Không có hình ảnh</span>
            </div>
          )}
        </div>

        <div className="banner-preview-modal__caption">
          <span>Preview theo tỉ lệ banner 4:5</span>

          <strong>1080 × 1350 px</strong>
        </div>
      </div>
    </AppModal>
  );
}

/* ========================================
   PropTypes
======================================== */

BannerPreviewModal.propTypes = {
  open: PropTypes.bool,

  banner: PropTypes.shape({
    title: PropTypes.string,

    imageUrl: PropTypes.string,

    active: PropTypes.bool,

    sortOrder: PropTypes.number,

    createdDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
  }),

  onClose: PropTypes.func.isRequired,
};

BannerPreviewModal.defaultProps = {
  open: false,

  banner: null,
};

export default BannerPreviewModal;
