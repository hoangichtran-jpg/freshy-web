import React from "react";

import PropTypes from "prop-types";

import { Image } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import { PhoneOutlined, PictureOutlined, StarFilled } from "@ant-design/icons";

import images from "../../../../assets/images";

import { formatPhoneNumberWithRegion } from "../../../../helpers";

import "./ServiceQualityDetailModal.scss";

/* ========================================
   Helpers
======================================== */

const isValidScore = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 5
  );
};

const getRatingClassName = (score) => {
  if (!isValidScore(score)) {
    return "service-quality-detail-modal__rating--unknown";
  }

  if (score <= 2) {
    return "service-quality-detail-modal__rating--low";
  }

  if (score === 3) {
    return "service-quality-detail-modal__rating--medium";
  }

  return "service-quality-detail-modal__rating--good";
};

/* ========================================
   Component
======================================== */

function ServiceQualityDetailModal({
  open,

  review,

  onClose,
}) {
  if (!review) {
    return null;
  }

  /* ========================================
     Derived data
  ======================================== */

  const formattedPhone = formatPhoneNumberWithRegion(review.customerPhone);

  const displayPhone = formattedPhone || "Chưa cập nhật";

  const note = String(review.rateNote || "").trim();

  const imagePaths = Array.isArray(review.imagePaths) ? review.imagePaths : [];

  const hasValidRating = isValidScore(review.rateScore);

  /* ========================================
     Render
  ======================================== */

  return (
    <AppModal
      open={open}
      width={820}
      footer={null}
      title={null}
      className="service-quality-detail-modal"
      onCancel={onClose}
    >
      {/* ========================================
          Header
      ======================================== */}

      <div className="service-quality-detail-modal__header">
        <span className="service-quality-detail-modal__eyebrow">
          Chất lượng dịch vụ
        </span>

        <div className="service-quality-detail-modal__heading">
          <div className="service-quality-detail-modal__title-group">
            <h2 className="service-quality-detail-modal__title">
              Chi tiết đánh giá
            </h2>

            <span className="service-quality-detail-modal__customer">
              <PhoneOutlined />

              {displayPhone}
            </span>
          </div>

          <div
            className={[
              "service-quality-detail-modal__rating",

              getRatingClassName(review.rateScore),
            ].join(" ")}
          >
            {hasValidRating ? (
              <>
                <StarFilled className="service-quality-detail-modal__rating-icon" />

                <strong>{review.rateScore}</strong>

                <span>/ 5</span>
              </>
            ) : (
              <span>Chưa có điểm hợp lệ</span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          Body
      ======================================== */}

      <div className="service-quality-detail-modal__body">
        {/* ========================================
            Feedback
        ======================================== */}

        <section className="service-quality-detail-modal__section">
          <div className="service-quality-detail-modal__section-header">
            <div>
              <span className="service-quality-detail-modal__section-eyebrow">
                Phản hồi
              </span>

              <h3>Nội dung khách hàng chia sẻ</h3>
            </div>
          </div>

          <div className="service-quality-detail-modal__feedback">
            {note ? (
              <p>{note}</p>
            ) : (
              <div className="service-quality-detail-modal__empty-feedback">
                Khách hàng không để lại nội dung phản hồi.
              </div>
            )}
          </div>
        </section>

        {/* ========================================
            Images
        ======================================== */}

        <section className="service-quality-detail-modal__section">
          <div className="service-quality-detail-modal__section-header service-quality-detail-modal__section-header--images">
            <div>
              <span className="service-quality-detail-modal__section-eyebrow">
                Hình ảnh
              </span>

              <h3>Ảnh đính kèm</h3>
            </div>

            {imagePaths.length > 0 ? (
              <span className="service-quality-detail-modal__image-count">
                <PictureOutlined />

                <strong>{imagePaths.length}</strong>

                <span>ảnh</span>
              </span>
            ) : null}
          </div>

          {imagePaths.length > 0 ? (
            <Image.PreviewGroup>
              <div className="service-quality-detail-modal__gallery">
                {imagePaths.map((imagePath, index) => (
                  <div
                    key={[imagePath, index].join("-")}
                    className="service-quality-detail-modal__image-item"
                  >
                    <Image
                      src={imagePath}
                      fallback={images.noImage}
                      alt={`Ảnh đánh giá ${index + 1}`}
                      preview={{
                        mask: "Xem ảnh",
                      }}
                    />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          ) : (
            <div className="service-quality-detail-modal__empty-images">
              <div className="service-quality-detail-modal__empty-images-icon">
                <PictureOutlined />
              </div>

              <strong>Không có hình ảnh đính kèm</strong>

              <span>
                Khách hàng chỉ gửi đánh giá bằng điểm hoặc nội dung phản hồi.
              </span>
            </div>
          )}
        </section>
      </div>
    </AppModal>
  );
}

/* ========================================
   PropTypes
======================================== */

ServiceQualityDetailModal.propTypes = {
  open: PropTypes.bool,

  review: PropTypes.shape({
    customerPhone: PropTypes.string,

    rateScore: PropTypes.number,

    rateNote: PropTypes.string,

    imagePaths: PropTypes.arrayOf(PropTypes.string),
  }),

  onClose: PropTypes.func.isRequired,
};

ServiceQualityDetailModal.defaultProps = {
  open: false,

  review: null,
};

export default ServiceQualityDetailModal;
