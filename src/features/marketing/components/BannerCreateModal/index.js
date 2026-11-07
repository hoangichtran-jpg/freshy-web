import React, { useEffect, useRef, useState, useCallback } from "react";

import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import {
  DeleteOutlined,
  InboxOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import AppInput from "../../../../shared/components/AppInput";
import AppInputNumber from "../../../../shared/components/AppInputNumber";

import {
  BANNER_IMAGE_CONFIG,
  BANNER_SORT_ORDER,
  BANNER_TITLE_MAX_LENGTH,
} from "../../constants";

import { formatFileSizeMB, prepareBannerImage } from "../../utils";

import "./BannerCreateModal.scss";

/* ========================================
   Initial state
======================================== */

const createInitialForm = () => ({
  title: "",

  sortOrder: BANNER_SORT_ORDER.defaultValue,
});

/* ========================================
   Component
======================================== */

function BannerCreateModal({ open, submitting, onCancel, onSubmit }) {
  const fileInputRef = useRef(null);

  const previewUrlRef = useRef(null);

  const [form, setForm] = useState(createInitialForm);

  const [selectedFile, setSelectedFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [imageError, setImageError] = useState("");

  const [processingImage, setProcessingImage] = useState(false);

  const [compressionInfo, setCompressionInfo] = useState(null);

  /* ========================================
     Preview cleanup
  ======================================== */

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);

      previewUrlRef.current = null;
    }
  }, []);

  /* ========================================
     Reset
  ======================================== */

  const resetForm = useCallback(() => {
    revokePreviewUrl();

    setForm(createInitialForm());

    setSelectedFile(null);

    setPreviewUrl("");

    setImageError("");

    setCompressionInfo(null);

    setProcessingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [revokePreviewUrl]);

  /* ========================================
     Modal lifecycle
  ======================================== */

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(
    () => () => {
      revokePreviewUrl();
    },
    [],
  );

  /* ========================================
     Select image
  ======================================== */

  const handleImage = async (file) => {
    if (!file) {
      return;
    }

    setImageError("");

    setCompressionInfo(null);

    setProcessingImage(true);

    try {
      const result = await prepareBannerImage(file);

      revokePreviewUrl();

      const objectUrl = URL.createObjectURL(result.file);

      previewUrlRef.current = objectUrl;

      setSelectedFile(result.file);

      setPreviewUrl(objectUrl);

      if (result.compressed) {
        setCompressionInfo({
          originalSize: result.originalSize,

          finalSize: result.finalSize,
        });
      }
    } catch (error) {
      setSelectedFile(null);

      revokePreviewUrl();

      setPreviewUrl("");

      setImageError(error.message || "Không thể xử lý ảnh.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setProcessingImage(false);
    }
  };

  /* ========================================
     File input
  ======================================== */

  const openFilePicker = () => {
    if (processingImage || submitting) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    handleImage(file);
  };

  /* ========================================
     Drag drop
  ======================================== */

  const handleDragOver = (event) => {
    event.preventDefault();

    if (processingImage || submitting) {
      return;
    }

    event.currentTarget.classList.add("banner-create-modal__upload--dragging");
  };

  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove(
      "banner-create-modal__upload--dragging",
    );
  };

  const handleDrop = (event) => {
    event.preventDefault();

    event.currentTarget.classList.remove(
      "banner-create-modal__upload--dragging",
    );

    if (processingImage || submitting) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    handleImage(file);
  };

  /* ========================================
     Remove image
  ======================================== */

  const removeImage = () => {
    revokePreviewUrl();

    setSelectedFile(null);

    setPreviewUrl("");

    setImageError("");

    setCompressionInfo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = () => {
    const title = form.title.trim();

    if (!title) {
      return;
    }

    if (!selectedFile) {
      setImageError("Vui lòng chọn ảnh quảng cáo.");

      return;
    }

    onSubmit({
      title,

      sortOrder: form.sortOrder ?? BANNER_SORT_ORDER.defaultValue,

      file: selectedFile,
    });
  };

  const canSubmit =
    Boolean(form.title.trim()) &&
    Boolean(selectedFile) &&
    !processingImage &&
    !submitting;

  /* ========================================
     Render
  ======================================== */

  return (
    <AppModal
      open={open}
      width={760}
      destroyOnClose={false}
      className="banner-create-modal"
      title={null}
      footer={null}
      closable={!submitting}
      maskClosable={!submitting}
      keyboard={!submitting}
      onCancel={onCancel}
    >
      {/* ========================================
          Heading
      ======================================== */}

      <div className="banner-create-modal__header">
        <span className="banner-create-modal__eyebrow">Quảng cáo mới</span>

        <h2 className="banner-create-modal__title">Thêm quảng cáo</h2>

        <p className="banner-create-modal__description">
          Tạo banner hiển thị tới khách hàng. Ảnh cần đúng tỉ lệ và kích thước
          để đảm bảo giao diện không bị cắt.
        </p>
      </div>

      {/* ========================================
          Content
      ======================================== */}

      <div className="banner-create-modal__grid">
        {/* ========================================
            Information
        ======================================== */}

        <section className="banner-create-modal__section">
          <div className="banner-create-modal__section-header">
            <span>Thông tin</span>
          </div>

          <div className="banner-create-modal__section-body">
            <div className="banner-create-modal__field">
              <label
                htmlFor="banner-title"
                className="banner-create-modal__label"
              >
                Tiêu đề
                <span aria-hidden="true">*</span>
              </label>

              <AppInput
                id="banner-title"
                value={form.title}
                maxLength={BANNER_TITLE_MAX_LENGTH}
                placeholder="Ví dụ: Ưu đãi cuối tuần"
                disabled={submitting}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,

                    title: event.target.value,
                  }));
                }}
              />

              <div className="banner-create-modal__field-footer">
                <span>Dùng tên ngắn để dễ quản lý.</span>

                <span>
                  {form.title.length}/{BANNER_TITLE_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="banner-create-modal__field">
              <label
                htmlFor="banner-sort-order"
                className="banner-create-modal__label"
              >
                Thứ tự hiển thị
              </label>

              <AppInputNumber
                id="banner-sort-order"
                min={BANNER_SORT_ORDER.min}
                max={BANNER_SORT_ORDER.max}
                value={form.sortOrder}
                disabled={submitting}
                className="banner-create-modal__sort-input"
                onChange={(value) => {
                  setForm((previous) => ({
                    ...previous,

                    sortOrder: value ?? BANNER_SORT_ORDER.defaultValue,
                  }));
                }}
              />

              <p className="banner-create-modal__helper">
                Số nhỏ hơn được ưu tiên hiển thị trước. Ví dụ: 0, 1, 2, 3.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================
            Image
        ======================================== */}

        <section className="banner-create-modal__section">
          <div className="banner-create-modal__section-header">
            <span>Hình ảnh</span>
          </div>

          <div className="banner-create-modal__section-body banner-create-modal__section-body--image">
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={BANNER_IMAGE_CONFIG.accept}
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="banner-create-modal__preview">
                <div className="banner-create-modal__preview-frame">
                  <img src={previewUrl} alt="Xem trước quảng cáo" />
                </div>

                <div className="banner-create-modal__preview-info">
                  <div className="banner-create-modal__file">
                    <span className="banner-create-modal__file-icon">
                      <PictureOutlined />
                    </span>

                    <div>
                      <strong>{selectedFile?.name}</strong>

                      <span>
                        {selectedFile
                          ? formatFileSizeMB(selectedFile.size)
                          : ""}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={submitting}
                    className="banner-create-modal__remove"
                    onClick={removeImage}
                  >
                    Xóa
                  </Button>
                </div>

                {compressionInfo ? (
                  <div className="banner-create-modal__optimized">
                    Ảnh đã được tối ưu từ{" "}
                    <strong>
                      {formatFileSizeMB(compressionInfo.originalSize)}
                    </strong>{" "}
                    xuống{" "}
                    <strong>
                      {formatFileSizeMB(compressionInfo.finalSize)}
                    </strong>
                    .
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                disabled={processingImage || submitting}
                className="banner-create-modal__upload"
                onClick={openFilePicker}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="banner-create-modal__upload-icon">
                  <InboxOutlined />
                </span>

                <strong>
                  {processingImage
                    ? "Đang xử lý ảnh..."
                    : "Chọn hoặc kéo ảnh vào đây"}
                </strong>

                <span>JPG, PNG hoặc WEBP</span>
              </button>
            )}

            <div className="banner-create-modal__image-requirements">
              <div>
                <span>Kích thước</span>

                <strong>
                  {BANNER_IMAGE_CONFIG.width} × {BANNER_IMAGE_CONFIG.height}
                  px
                </strong>
              </div>

              <div>
                <span>Tỉ lệ</span>

                <strong>{BANNER_IMAGE_CONFIG.aspectRatio}</strong>
              </div>

              <div>
                <span>Dung lượng</span>

                <strong>
                  ≤ {BANNER_IMAGE_CONFIG.maxSizeMB}
                  MB
                </strong>
              </div>
            </div>

            {imageError ? (
              <p className="banner-create-modal__error" role="alert">
                {imageError}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {/* ========================================
          Footer
      ======================================== */}

      <div className="banner-create-modal__footer">
        <Button disabled={submitting} onClick={onCancel}>
          Hủy
        </Button>

        <Button
          type="primary"
          loading={submitting}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Tạo quảng cáo
        </Button>
      </div>
    </AppModal>
  );
}

/* ========================================
   PropTypes
======================================== */

BannerCreateModal.propTypes = {
  open: PropTypes.bool,

  submitting: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

BannerCreateModal.defaultProps = {
  open: false,

  submitting: false,
};

export default BannerCreateModal;
