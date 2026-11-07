import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Checkbox } from "antd";

import { CloseOutlined, HolderOutlined } from "@ant-design/icons";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";

import AppInput from "../../../../shared/components/AppInput";

import { getBusinessTextValidationError, normalizeBusinessText } from "../../../../shared/utils/businessTextValidation";

import SearchInput from "../../../../shared/components/SearchInput";

import "./MenuFormModal.scss";

/* ========================================
   Helpers
======================================== */

const getItemId = (item) => item?.itemId ?? item?.id ?? null;

const normalizeSelectedItems = (entries) =>
  entries.map((entry, index) => ({
    ...entry,

    ordinalNumber: index + 1,
  }));

const buildInitialSelection = (menu, availableItems) => {
  if (!menu || !Array.isArray(menu.items)) {
    return [];
  }

  const entries = menu.items
    .slice()
    .sort(
      (first, second) =>
        Number(first?.ordinalNumber ?? 0) - Number(second?.ordinalNumber ?? 0),
    )
    .map((entry) => {
      const itemId = getItemId(entry);

      const fullItem = availableItems.find(
        (item) => getItemId(item) === itemId,
      );

      return {
        item: fullItem || {
          itemId,

          name: entry?.name || `Món #${itemId}`,
        },
      };
    })
    .filter((entry) => getItemId(entry.item) != null);

  return normalizeSelectedItems(entries);
};

/* ========================================
   Component
======================================== */

function MenuFormModal({
  open,
  mode,
  menu,
  items,
  itemsLoading,
  submitting,
  onCancel,
  onSubmit,
}) {
  const [menuName, setMenuName] = useState("");

  const [selectedItems, setSelectedItems] = useState([]);

  const [query, setQuery] = useState("");

  const [draggedIndex, setDraggedIndex] = useState(null);

  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [error, setError] = useState("");

  const isEdit = mode === "edit";

  /* ========================================
     Initial state
  ======================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setMenuName(isEdit ? menu?.menuName || "" : "");

    setSelectedItems(isEdit ? buildInitialSelection(menu, items) : []);

    setQuery("");

    setDraggedIndex(null);

    setDragOverIndex(null);

    setError("");
  }, [open, isEdit, menu, items]);

  /* ========================================
     Selected IDs
  ======================================== */

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((entry) => getItemId(entry.item))),
    [selectedItems],
  );

  /* ========================================
     Search
  ======================================== */

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");

    return items
      .filter((item) =>
        String(item?.name || "")
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
  }, [items, query]);

  /* ========================================
     Selected position
  ======================================== */

  const getSelectedPosition = (itemId) => {
    const index = selectedItems.findIndex(
      (entry) => getItemId(entry.item) === itemId,
    );

    return index >= 0 ? index + 1 : null;
  };

  /* ========================================
     Select / unselect item
  ======================================== */

  const toggleItem = (item, checked) => {
    const itemId = getItemId(item);

    if (itemId == null) {
      return;
    }

    setError("");

    setSelectedItems((previous) => {
      if (checked) {
        const exists = previous.some(
          (entry) => getItemId(entry.item) === itemId,
        );

        if (exists) {
          return previous;
        }

        return normalizeSelectedItems([
          ...previous,

          {
            item,
          },
        ]);
      }

      return normalizeSelectedItems(
        previous.filter((entry) => getItemId(entry.item) !== itemId),
      );
    });
  };

  /* ========================================
     Drag & drop
  ======================================== */

  const handleDragStart = (event, index) => {
    setDraggedIndex(index);

    event.dataTransfer.effectAllowed = "move";

    /*
     * Firefox cần setData để
     * native drag hoạt động.
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

    setSelectedItems((previous) => {
      const reordered = [...previous];

      const [movedItem] = reordered.splice(draggedIndex, 1);

      reordered.splice(targetIndex, 0, movedItem);

      return normalizeSelectedItems(reordered);
    });

    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = () => {
    const normalizedName = normalizeBusinessText(menuName);

    const nameError = getBusinessTextValidationError(menuName, {
      fieldLabel: "Tên thực đơn",

      maxLength: 100,
    });

    if (nameError) {
      setError(nameError);

      return;
    }

    if (selectedItems.length === 0) {
      setError("Hãy chọn ít nhất một món ăn.");

      return;
    }

    onSubmit({
      menuName: normalizedName,

      items: selectedItems.map((entry, index) => ({
        itemId: getItemId(entry.item),

        ordinalNumber: index + 1,
      })),
    });
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementFormModal
      open={open}
      width={880}
      title={isEdit ? "Chỉnh sửa thực đơn" : "Tạo thực đơn"}
      description={
        isEdit
          ? "Cập nhật tên, món ăn và thứ tự hiển thị trong thực đơn."
          : "Đặt tên, chọn món và sắp xếp thứ tự hiển thị trong thực đơn."
      }
      loading={submitting}
      primaryText={isEdit ? "Lưu thay đổi" : "Tạo thực đơn"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="menu-form-modal">
        {/* =================================
            MENU NAME
        ================================= */}

        <div className="menu-form-modal__field">
          <label htmlFor="menu-name">Tên thực đơn</label>

          <AppInput
            id="menu-name"
            autoFocus
            maxLength={100}
            value={menuName}
            placeholder="Ví dụ: Menu buổi sáng"
            onChange={(event) => {
              /*
               * Keep raw input while the user is typing.
               * Normalize and validate only at submit.
               */
              setMenuName(event.target.value);

              setError("");
            }}
          />
        </div>

        {/* =================================
            WORKSPACE
        ================================= */}

        <div className="menu-form-modal__grid">
          {/* ===============================
              SELECTED ITEMS
          =============================== */}

          <section className="menu-form-modal__panel">
            <div className="menu-form-modal__panel-header">
              <div>
                <strong>Món đã chọn</strong>

                <span>
                  {selectedItems.length > 1
                    ? `${selectedItems.length} món · Kéo để đổi thứ tự`
                    : `${selectedItems.length} món`}
                </span>
              </div>
            </div>

            <div className="menu-form-modal__selected-list">
              {selectedItems.length > 0 ? (
                selectedItems.map((entry, index) => {
                  const itemId = getItemId(entry.item);

                  return (
                    <div
                      key={itemId}
                      className={[
                        "menu-form-modal__selected-row",

                        draggedIndex === index
                          ? "menu-form-modal__selected-row--dragging"
                          : "",

                        dragOverIndex === index && draggedIndex !== index
                          ? "menu-form-modal__selected-row--drag-over"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onDragOver={(event) => handleDragOver(event, index)}
                      onDrop={(event) => handleDrop(event, index)}
                    >
                      <span
                        draggable
                        className="menu-form-modal__drag-handle"
                        title="Kéo để đổi thứ tự"
                        onDragStart={(event) => handleDragStart(event, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <HolderOutlined />
                      </span>

                      <span className="menu-form-modal__ordinal">
                        {index + 1}
                      </span>

                      <div className="menu-form-modal__selected-info">
                        <strong>{entry.item?.name || `Món #${itemId}`}</strong>
                      </div>

                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        className="menu-form-modal__remove"
                        aria-label={`Bỏ ${entry.item?.name || "món ăn"}`}
                        onClick={() => toggleItem(entry.item, false)}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="menu-form-modal__empty">
                  <strong>Chưa có món nào</strong>

                  <span>Chọn món từ danh sách bên cạnh.</span>
                </div>
              )}
            </div>
          </section>

          {/* ===============================
              AVAILABLE ITEMS
          =============================== */}

          <section className="menu-form-modal__panel">
            <div className="menu-form-modal__available-header">
              <div>
                <strong>Danh sách món ăn</strong>

                <span>{items.length} món khả dụng</span>
              </div>

              <SearchInput
                size="sm"
                allowClear
                value={query}
                placeholder="Tìm món ăn..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="menu-form-modal__available-list">
              {itemsLoading ? (
                <div className="menu-form-modal__empty">Đang tải món ăn...</div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const itemId = getItemId(item);

                  const checked = selectedIds.has(itemId);

                  const position = checked ? getSelectedPosition(itemId) : null;

                  return (
                    <label
                      key={itemId}
                      className={[
                        "menu-form-modal__available-row",

                        checked
                          ? "menu-form-modal__available-row--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) =>
                          toggleItem(item, event.target.checked)
                        }
                      />

                      <span className="menu-form-modal__available-name">
                        {item.name}
                      </span>

                      {position ? (
                        <span className="menu-form-modal__available-order">
                          #{position}
                        </span>
                      ) : null}
                    </label>
                  );
                })
              ) : (
                <div className="menu-form-modal__empty">
                  Không tìm thấy món phù hợp.
                </div>
              )}
            </div>
          </section>
        </div>

        {error ? <div className="menu-form-modal__error">{error}</div> : null}
      </div>
    </ManagementFormModal>
  );
}

MenuFormModal.propTypes = {
  open: PropTypes.bool.isRequired,

  mode: PropTypes.oneOf(["create", "edit"]),

  menu: PropTypes.object,

  items: PropTypes.arrayOf(PropTypes.object),

  itemsLoading: PropTypes.bool,

  submitting: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

MenuFormModal.defaultProps = {
  mode: "create",
  menu: null,
  items: [],
  itemsLoading: false,
  submitting: false,
};

export default MenuFormModal;
