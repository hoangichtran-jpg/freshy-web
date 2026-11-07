import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Checkbox } from "antd";

import { CameraOutlined, CloseOutlined, HolderOutlined } from "@ant-design/icons";

import pica from "pica";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";

import AppInput from "../../../../shared/components/AppInput";

import AppInputNumber from "../../../../shared/components/AppInputNumber";

import { getBusinessTextValidationError, normalizeBusinessText } from "../../../../shared/utils/businessTextValidation";

import SearchInput from "../../../../shared/components/SearchInput";

import "./ItemFormModal.scss";

const imageResizer = pica({
  features: ["js", "wasm", "cib"],
});

/* ========================================
   Selected topping groups
======================================== */

const normalizeSelectedGroups = (groups) =>
  groups.map((group, index) => ({
    ...group,

    ordinalNumber: index + 1,
  }));

const buildInitialGroups = (item) => {
  const groups = Array.isArray(item?.toppingDTO) ? item.toppingDTO : [];

  return normalizeSelectedGroups(
    groups
      .slice()
      .sort(
        (first, second) =>
          Number(first?.ordinalNumber ?? 0) -
          Number(second?.ordinalNumber ?? 0),
      )
      .map((group) => ({
        id: group.id,
      }))
      .filter((group) => group.id != null),
  );
};

function ItemFormModal({
  open,
  mode,
  item,
  toppingGroups,
  toppingGroupsLoading,
  submitting,
  managerPhone,
  onCancel,
  onSubmit,
}) {
  const [name, setName] = useState("");

  const [price, setPrice] = useState(0);

  const [selectedGroups, setSelectedGroups] = useState([]);

  const [query, setQuery] = useState("");

  const [imageFile, setImageFile] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);

  const [processingImage, setProcessingImage] = useState(false);

  const [draggedIndex, setDraggedIndex] = useState(null);

  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [error, setError] = useState("");

  const isEdit = mode === "edit";

  /* ========================================
     Initial data
  ======================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(item?.name || "");

    setPrice(Number(item?.taPrice || 0));

    setSelectedGroups(buildInitialGroups(item));

    setQuery("");

    setImageFile(null);

    setImagePreview(item?.imagePath || null);

    setProcessingImage(false);

    setDraggedIndex(null);

    setDragOverIndex(null);

    setError("");
  }, [open, item]);

  /*
   * Cleanup object URL.
   */
  useEffect(
    () => () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

  /* ========================================
     Selected IDs
  ======================================== */

  const selectedIds = useMemo(
    () => new Set(selectedGroups.map((group) => group.id)),
    [selectedGroups],
  );

  /* ========================================
     Search topping groups
  ======================================== */

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");

    return toppingGroups
      .filter((group) =>
        String(group?.name || "")
          .toLocaleLowerCase("vi")
          .includes(normalized),
      )
      .slice()
      .sort((first, second) =>
        String(first?.name || "").localeCompare(
          String(second?.name || ""),
          "vi",
        ),
      );
  }, [toppingGroups, query]);

  /* ========================================
     Group helpers
  ======================================== */

  const getGroupById = (groupId) =>
    toppingGroups.find((group) => group.id === groupId);

  const getActiveToppingCount = (group) =>
    (group?.toppings || []).filter((topping) => topping.isActive !== false)
      .length;

  const toggleGroup = (groupId, checked) => {
    setError("");

    setSelectedGroups((previous) => {
      if (checked) {
        const exists = previous.some((group) => group.id === groupId);

        if (exists) {
          return previous;
        }

        return normalizeSelectedGroups([
          ...previous,

          {
            id: groupId,
          },
        ]);
      }

      return normalizeSelectedGroups(
        previous.filter((group) => group.id !== groupId),
      );
    });
  };

  /* ========================================
     Drag & drop selected groups
  ======================================== */

  const handleDragStart = (event, index) => {
    setDraggedIndex(index);

    event.dataTransfer.effectAllowed = "move";

    /*
     * Firefox cần setData
     * để native drag hoạt động.
     */
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();

    if (draggedIndex == null) {
      return;
    }

    if (draggedIndex === targetIndex) {
      setDraggedIndex(null);

      setDragOverIndex(null);

      return;
    }

    setSelectedGroups((previous) => {
      const reordered = [...previous];

      const [movedGroup] = reordered.splice(draggedIndex, 1);

      reordered.splice(targetIndex, 0, movedGroup);

      return normalizeSelectedGroups(reordered);
    });

    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  /* ========================================
     Image
  ======================================== */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ.");

      return;
    }

    setProcessingImage(true);

    setError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);
      });

      const image = await new Promise((resolve, reject) => {
        const nextImage = new Image();

        nextImage.onload = () => resolve(nextImage);

        nextImage.onerror = reject;

        nextImage.src = dataUrl;
      });

      const input = document.createElement("canvas");

      input.width = image.width;

      input.height = image.height;

      input.getContext("2d").drawImage(image, 0, 0);

      const maxSize = 1200;

      const ratio = Math.min(
        maxSize / image.width,

        maxSize / image.height,

        1,
      );

      const output = document.createElement("canvas");

      output.width = Math.round(image.width * ratio);

      output.height = Math.round(image.height * ratio);

      await imageResizer.resize(input, output, {
        unsharpAmount: 80,

        unsharpRadius: 0.6,

        unsharpThreshold: 2,
      });

      const blob = await imageResizer.toBlob(output, "image/jpeg", 0.8);

      const resizedFile = new File([blob], file.name, {
        type: "image/jpeg",
      });

      /*
       * Revoke preview cũ nếu là
       * object URL.
       */
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(resizedFile);

      setImagePreview(URL.createObjectURL(blob));
    } catch (_) {
      setError("Không thể xử lý ảnh. Vui lòng chọn ảnh khác.");
    } finally {
      setProcessingImage(false);
    }
  };

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = () => {
    const normalizedName = normalizeBusinessText(name);

    const nameError = getBusinessTextValidationError(name, {
      fieldLabel: "Tên món ăn",

      maxLength: 150,
    });

    if (nameError) {
      setError(nameError);

      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      setError("Giá bán chưa hợp lệ.");

      return;
    }

    onSubmit(
      {
        itemId: item?.itemId ?? null,

        name: normalizedName,

        taPrice: Number(price),

        otsPrice: Number(item?.otsPrice || 0),

        text: item?.text || "",

        isActive: true,

        managerPhone,

        /*
         * Thứ tự hiện tại của
         * selectedGroups chính là
         * thứ tự user kéo thả.
         */
        toppingGroupIds: selectedGroups.map((group, index) => ({
          toppingGroupId: group.id,

          ordinalNumber: index + 1,
        })),
      },

      imageFile,
    );
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementFormModal
      open={open}
      width={960}
      title={isEdit ? "Chỉnh sửa món ăn" : "Thêm món ăn"}
      description={
        isEdit
          ? "Cập nhật thông tin món ăn và thứ tự nhóm topping."
          : "Tạo món mới và cấu hình các nhóm topping áp dụng."
      }
      loading={submitting}
      primaryDisabled={processingImage}
      primaryText={isEdit ? "Lưu thay đổi" : "Thêm món ăn"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="item-form-modal">
        {/* =================================
            BASIC INFORMATION
        ================================= */}

        <section className="item-form-modal__basic">
          <div className="item-form-modal__image-block">
            <label className="item-form-modal__label">Hình ảnh</label>

            <label className="item-form-modal__upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <img src={imagePreview} alt="Xem trước món ăn" />
              ) : (
                <div className="item-form-modal__upload-empty">
                  <CameraOutlined />

                  <strong>Chọn ảnh món ăn</strong>

                  <span>JPG hoặc PNG</span>
                </div>
              )}

              {processingImage ? (
                <div className="item-form-modal__processing">
                  Đang xử lý ảnh...
                </div>
              ) : null}
            </label>
          </div>

          <div className="item-form-modal__basic-fields">
            <div className="item-form-modal__field">
              <label className="item-form-modal__label">Tên món</label>

              <AppInput
                autoFocus
                value={name}
                maxLength={150}
                placeholder="Ví dụ: Cơm gà Freshy"
                onChange={(event) => {
                  /*
                   * Keep the raw controlled value while typing.
                   * Business normalization / validation only runs
                   * when the user submits the form.
                   */
                  setName(event.target.value);

                  setError("");
                }}
              />
            </div>

            <div className="item-form-modal__field">
              <label className="item-form-modal__label">Giá bán</label>

              <div className="item-form-modal__price-wrap">
                <AppInputNumber
                  min={0}
                  precision={0}
                  value={price}
                  placeholder="0"
                  formatter={(value) =>
                    `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value) => String(value || "").replace(/\./g, "")}
                  onChange={(value) => {
                    setPrice(value ?? 0);

                    setError("");
                  }}
                />

                <span className="item-form-modal__currency">VNĐ</span>
              </div>
            </div>

            <div className="item-form-modal__basic-note">
              <span>
                Ảnh nên có tỷ lệ vuông hoặc gần vuông để hiển thị đẹp trong danh
                sách món ăn.
              </span>
            </div>
          </div>
        </section>

        {/* =================================
            TOPPING HEADING
        ================================= */}

        <div className="item-form-modal__topping-heading">
          <div>
            <strong>Nhóm topping</strong>

            <span>
              Chọn các nhóm áp dụng và kéo để sắp xếp thứ tự hiển thị.
            </span>
          </div>

          <span className="item-form-modal__selected-count">
            {selectedGroups.length} nhóm đã chọn
          </span>
        </div>

        {/* =================================
            TOPPING WORKSPACE
        ================================= */}

        <div className="item-form-modal__topping-grid">
          {/* ===============================
              SELECTED
          =============================== */}

          <section className="item-form-modal__selected-panel">
            <div className="item-form-modal__panel-header">
              <div>
                <strong>Đã chọn</strong>

                <span>
                  {selectedGroups.length > 1
                    ? "Kéo để đổi thứ tự"
                    : "Thứ tự hiển thị của nhóm topping"}
                </span>
              </div>
            </div>

            <div className="item-form-modal__selected-list">
              {selectedGroups.length > 0 ? (
                selectedGroups.map((selected, index) => {
                  const group = getGroupById(selected.id);

                  const toppingCount = getActiveToppingCount(group);

                  return (
                    <div
                      key={selected.id}
                      className={[
                        "item-form-modal__selected-row",

                        draggedIndex === index
                          ? "item-form-modal__selected-row--dragging"
                          : "",

                        dragOverIndex === index && draggedIndex !== index
                          ? "item-form-modal__selected-row--drag-over"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onDragOver={(event) => handleDragOver(event, index)}
                      onDrop={(event) => handleDrop(event, index)}
                    >
                      <span
                        draggable
                        className="item-form-modal__drag-handle"
                        title="Kéo để đổi thứ tự"
                        onDragStart={(event) => handleDragStart(event, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <HolderOutlined />
                      </span>

                      <span className="item-form-modal__ordinal">
                        {index + 1}
                      </span>

                      <div className="item-form-modal__selected-info">
                        <strong>{group?.name || `Nhóm #${selected.id}`}</strong>

                        <span>{toppingCount} topping</span>
                      </div>

                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        aria-label={`Bỏ ${group?.name || "nhóm topping"}`}
                        className="item-form-modal__remove"
                        onClick={() => toggleGroup(selected.id, false)}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="item-form-modal__empty item-form-modal__empty--selected">
                  <strong>Chưa chọn nhóm topping</strong>

                  <span>Chọn nhóm từ danh sách bên cạnh.</span>
                </div>
              )}
            </div>
          </section>

          {/* ===============================
              AVAILABLE
          =============================== */}

          <section className="item-form-modal__available-panel">
            <div className="item-form-modal__panel-header item-form-modal__panel-header--available">
              <div>
                <strong>Danh sách nhóm topping</strong>

                <span>{toppingGroups.length} nhóm khả dụng</span>
              </div>

              <SearchInput
                size="sm"
                allowClear
                value={query}
                placeholder="Tìm nhóm topping..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="item-form-modal__group-list">
              {toppingGroupsLoading ? (
                <div className="item-form-modal__empty">
                  Đang tải nhóm topping...
                </div>
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map((group) => {
                  const checked = selectedIds.has(group.id);

                  const activeCount = getActiveToppingCount(group);

                  return (
                    <label
                      key={group.id}
                      className={[
                        "item-form-modal__group-row",

                        checked ? "item-form-modal__group-row--selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) =>
                          toggleGroup(group.id, event.target.checked)
                        }
                      />

                      <div className="item-form-modal__group-info">
                        <strong>{group.name}</strong>

                        <span>{activeCount} topping</span>
                      </div>

                      {checked ? (
                        <span className="item-form-modal__group-order">
                          #
                          {selectedGroups.findIndex(
                            (selected) => selected.id === group.id,
                          ) + 1}
                        </span>
                      ) : null}
                    </label>
                  );
                })
              ) : (
                <div className="item-form-modal__empty">
                  Không tìm thấy nhóm topping.
                </div>
              )}
            </div>
          </section>
        </div>

        {error ? <div className="item-form-modal__error">{error}</div> : null}
      </div>
    </ManagementFormModal>
  );
}

ItemFormModal.propTypes = {
  open: PropTypes.bool.isRequired,

  mode: PropTypes.oneOf(["create", "edit"]),

  item: PropTypes.object,

  toppingGroups: PropTypes.arrayOf(PropTypes.object),

  toppingGroupsLoading: PropTypes.bool,

  submitting: PropTypes.bool,

  managerPhone: PropTypes.string,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

ItemFormModal.defaultProps = {
  mode: "create",
  item: null,
  toppingGroups: [],
  toppingGroupsLoading: false,
  submitting: false,
  managerPhone: "",
};

export default ItemFormModal;
