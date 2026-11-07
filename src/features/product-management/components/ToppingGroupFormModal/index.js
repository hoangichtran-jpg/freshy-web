import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Checkbox, Radio } from "antd";

import { CloseOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";

import AppInput from "../../../../shared/components/AppInput";

import AppInputNumber from "../../../../shared/components/AppInputNumber";

import { getBusinessTextValidationError, normalizeBusinessText } from "../../../../shared/utils/businessTextValidation";

import SearchInput from "../../../../shared/components/SearchInput";

import "./ToppingGroupFormModal.scss";

const getToppingIdentity = (topping) => {
  if (topping?.toppingId != null) {
    return `id:${topping.toppingId}`;
  }

  if (topping?.__localId) {
    return `local:${topping.__localId}`;
  }

  return `name:${topping?.toppingName || ""}`;
};

const getToppingKey = (topping, index) => getToppingIdentity(topping) || index;

const upsertChange = (changes, topping) => {
  const identity = getToppingIdentity(topping);

  const index = changes.findIndex(
    (current) => getToppingIdentity(current) === identity,
  );

  if (index === -1) {
    return [...changes, topping];
  }

  return changes.map((current, currentIndex) =>
    currentIndex === index ? topping : current,
  );
};

const normalizeOrder = (list) =>
  list.map((topping, index) => ({
    ...topping,

    ordinalNumber: index + 1,
  }));

function ToppingGroupFormModal({
  open,
  mode,
  group,
  managerPhone,
  submitting,
  onCancel,
  onSubmit,
}) {
  const [groupName, setGroupName] = useState("");

  const [minPermitted, setMinPermitted] = useState(1);

  const [maxPermitted, setMaxPermitted] = useState(1);

  const [limitType, setLimitType] = useState("single");

  const [toppings, setToppings] = useState([]);

  const [changes, setChanges] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [newToppingName, setNewToppingName] = useState("");

  const [newToppingPrice, setNewToppingPrice] = useState(null);

  const [draggedIndex, setDraggedIndex] = useState(null);

  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [error, setError] = useState("");

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextMax = Number(group?.maxPermitted ?? 1);

    setGroupName(group?.name || "");

    setMinPermitted(Number(group?.minPermitted ?? 1));

    setMaxPermitted(nextMax > 0 ? nextMax : 1);

    setLimitType(nextMax > 1 ? "multiple" : "single");

    setToppings(
      Array.isArray(group?.toppings)
        ? group.toppings.map((topping, index) => ({
            ...topping,

            __localId: topping.__localId || `initial-${index}`,
          }))
        : [],
    );

    setChanges([]);

    setSearchText("");

    setNewToppingName("");

    setNewToppingPrice(null);

    setDraggedIndex(null);

    setDragOverIndex(null);

    setError("");
  }, [open, group]);

  /* ========================================
     Active toppings
  ======================================== */

  const activeToppings = useMemo(
    () =>
      toppings
        .filter((topping) => topping.isActive !== false)
        .slice()
        .sort(
          (first, second) =>
            Number(first.ordinalNumber ?? 0) -
            Number(second.ordinalNumber ?? 0),
        ),
    [toppings],
  );

  /* ========================================
     Search
  ======================================== */

  const filteredToppings = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase("vi");

    return toppings
      .filter((topping) =>
        String(topping.toppingName || "")
          .toLocaleLowerCase("vi")
          .includes(query),
      )
      .slice()
      .sort((first, second) =>
        String(first.toppingName || "").localeCompare(
          String(second.toppingName || ""),
          "vi",
        ),
      );
  }, [toppings, searchText]);

  /* ========================================
     Apply active order
  ======================================== */

  const applyActiveOrder = (orderedActive) => {
    const normalized = normalizeOrder(orderedActive);

    const normalizedMap = new Map(
      normalized.map((topping) => [getToppingIdentity(topping), topping]),
    );

    setToppings((previous) =>
      previous.map(
        (topping) => normalizedMap.get(getToppingIdentity(topping)) || topping,
      ),
    );

    setChanges((previous) =>
      normalized.reduce(
        (nextChanges, topping) => upsertChange(nextChanges, topping),

        previous,
      ),
    );
  };

  /* ========================================
     Toggle topping
  ======================================== */

  const toggleTopping = (topping, checked) => {
    setError("");

    const identity = getToppingIdentity(topping);

    const nextTopping = {
      ...topping,

      isActive: checked,

      ordinalNumber: checked
        ? activeToppings.length + 1
        : topping.ordinalNumber,
    };

    if (checked) {
      setToppings((previous) =>
        previous.map((current) =>
          getToppingIdentity(current) === identity ? nextTopping : current,
        ),
      );

      setChanges((previous) => upsertChange(previous, nextTopping));

      return;
    }

    const remainingActive = normalizeOrder(
      activeToppings.filter(
        (current) => getToppingIdentity(current) !== identity,
      ),
    );

    const remainingMap = new Map(
      remainingActive.map((current) => [getToppingIdentity(current), current]),
    );

    setToppings((previous) =>
      previous.map((current) => {
        const currentIdentity = getToppingIdentity(current);

        if (currentIdentity === identity) {
          return nextTopping;
        }

        return remainingMap.get(currentIdentity) || current;
      }),
    );

    setChanges((previous) => {
      let nextChanges = upsertChange(previous, nextTopping);

      remainingActive.forEach((current) => {
        nextChanges = upsertChange(nextChanges, current);
      });

      return nextChanges;
    });
  };

  /* ========================================
     Remove selected topping
  ======================================== */

  const removeSelectedTopping = (topping) => {
    const identity = getToppingIdentity(topping);

    /*
     * Topping mới chưa lưu:
     * xóa hẳn khỏi local state.
     */
    if (topping.toppingId == null) {
      const remainingActive = normalizeOrder(
        activeToppings.filter(
          (current) => getToppingIdentity(current) !== identity,
        ),
      );

      const remainingMap = new Map(
        remainingActive.map((current) => [
          getToppingIdentity(current),

          current,
        ]),
      );

      setToppings((previous) =>
        previous
          .filter((current) => getToppingIdentity(current) !== identity)
          .map(
            (current) =>
              remainingMap.get(getToppingIdentity(current)) || current,
          ),
      );

      setChanges((previous) => {
        let nextChanges = previous.filter(
          (current) => getToppingIdentity(current) !== identity,
        );

        remainingActive.forEach((current) => {
          nextChanges = upsertChange(nextChanges, current);
        });

        return nextChanges;
      });

      return;
    }

    toggleTopping(topping, false);
  };

  /* ========================================
     Drag & drop reorder
  ======================================== */

  const handleDragStart = (event, index) => {
    setDraggedIndex(index);

    event.dataTransfer.effectAllowed = "move";

    /*
     * Firefox cần setData để drag
     * hoạt động ổn định.
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

    if (draggedIndex == null || draggedIndex === targetIndex) {
      setDraggedIndex(null);

      setDragOverIndex(null);

      return;
    }

    const reordered = [...activeToppings];

    const [movedItem] = reordered.splice(draggedIndex, 1);

    reordered.splice(targetIndex, 0, movedItem);

    applyActiveOrder(reordered);

    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  /* ========================================
     Add topping
  ======================================== */

  const addTopping = () => {
    const toppingName = normalizeBusinessText(newToppingName);

    const nameError = getBusinessTextValidationError(newToppingName, {
      fieldLabel: "Tên topping",

      maxLength: 120,
    });

    const price = Number(newToppingPrice);

    if (nameError) {
      setError(nameError);

      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá topping chưa hợp lệ.");

      return;
    }

    const duplicated = toppings.some(
      (topping) =>
        normalizeBusinessText(topping.toppingName).toLocaleLowerCase("vi") ===
        toppingName.toLocaleLowerCase("vi"),
    );

    if (duplicated) {
      setError("Topping này đã tồn tại trong nhóm.");

      return;
    }

    const topping = {
      __localId: `new-${Date.now()}`,

      toppingName,

      tapPrice: price,

      isActive: true,

      ordinalNumber: activeToppings.length + 1,
    };

    setToppings((previous) => [...previous, topping]);

    setChanges((previous) => [...previous, topping]);

    setNewToppingName("");

    setNewToppingPrice(null);

    setError("");
  };

  /* ========================================
     Limit
  ======================================== */

  const handleLimitTypeChange = (event) => {
    const value = event.target.value;

    setLimitType(value);

    if (value === "single") {
      setMaxPermitted(1);
    } else if (Number(maxPermitted) <= 1) {
      setMaxPermitted(2);
    }
  };

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = () => {
    const name = normalizeBusinessText(groupName);

    const nameError = getBusinessTextValidationError(groupName, {
      fieldLabel: "Tên nhóm topping",

      maxLength: 120,
    });

    const min = Number(minPermitted);

    const max = Number(maxPermitted);

    if (nameError) {
      setError(nameError);

      return;
    }

    if (!Number.isFinite(min) || min < 0) {
      setError("Số lượng tối thiểu chưa hợp lệ.");

      return;
    }

    if (!Number.isFinite(max) || max < 1) {
      setError("Số lượng tối đa phải từ 1 trở lên.");

      return;
    }

    if (min > max) {
      setError("Số lượng tối thiểu không thể lớn hơn số lượng tối đa.");

      return;
    }

    onSubmit({
      name,

      toppings: changes.map(({ __localId, ...topping }) => topping),

      isActive: group?.isActive ?? true,

      maxPermitted: max,

      minPermitted: min,

      managerPhone,
    });
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementFormModal
      open={open}
      width={940}
      title={isEdit ? "Chỉnh sửa nhóm topping" : "Thêm nhóm topping"}
      description={
        isEdit
          ? "Cập nhật thông tin, giới hạn và thứ tự topping đang sử dụng."
          : "Tạo nhóm topping và thiết lập các lựa chọn ban đầu."
      }
      loading={submitting}
      primaryText={isEdit ? "Lưu thay đổi" : "Tạo nhóm topping"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="topping-group-form-modal">
        <div className="topping-group-form-modal__grid">
          {/* ================================
              LEFT
          ================================ */}

          <section className="topping-group-form-modal__settings">
            <div className="topping-group-form-modal__field">
              <label>Tên nhóm topping</label>

              <AppInput
                autoFocus
                maxLength={120}
                value={groupName}
                placeholder="Ví dụ: Lượng cơm"
                onChange={(event) => {
                  /*
                   * Keep raw input while typing.
                   * Normalize and validate only when submitting.
                   */
                  setGroupName(event.target.value);

                  setError("");
                }}
              />
            </div>

            <div className="topping-group-form-modal__section">
              <div className="topping-group-form-modal__section-heading">
                <strong>Quy tắc lựa chọn</strong>

                <span>Cấu hình số topping khách có thể chọn.</span>
              </div>

              <Radio.Group
                value={limitType}
                onChange={handleLimitTypeChange}
                className="topping-group-form-modal__radio-group"
              >
                <Radio.Button value="single">Chọn duy nhất</Radio.Button>

                <Radio.Button value="multiple">Chọn nhiều</Radio.Button>
              </Radio.Group>

              <div className="topping-group-form-modal__limits">
                <div>
                  <label>Tối thiểu</label>

                  <AppInputNumber
                    min={0}
                    precision={0}
                    value={minPermitted}
                    onChange={(value) => setMinPermitted(value ?? 0)}
                  />
                </div>

                <div>
                  <label>Tối đa</label>

                  <AppInputNumber
                    min={1}
                    precision={0}
                    disabled={limitType === "single"}
                    value={maxPermitted}
                    onChange={(value) => setMaxPermitted(value ?? 1)}
                  />
                </div>
              </div>
            </div>

            <div className="topping-group-form-modal__selected">
              <div className="topping-group-form-modal__selected-header">
                <div>
                  <strong>Đang chọn</strong>

                  <span>{activeToppings.length} topping</span>
                </div>

                {activeToppings.length > 1 ? (
                  <span className="topping-group-form-modal__reorder-hint">
                    Kéo để đổi thứ tự
                  </span>
                ) : null}
              </div>

              <div className="topping-group-form-modal__selected-list">
                {activeToppings.length > 0 ? (
                  activeToppings.map((topping, index) => (
                    <div
                      key={getToppingKey(topping, index)}
                      className={[
                        "topping-group-form-modal__selected-row",

                        draggedIndex === index
                          ? "topping-group-form-modal__selected-row--dragging"
                          : "",

                        dragOverIndex === index && draggedIndex !== index
                          ? "topping-group-form-modal__selected-row--drag-over"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onDragOver={(event) => handleDragOver(event, index)}
                      onDrop={(event) => handleDrop(event, index)}
                    >
                      <span
                        draggable
                        className="topping-group-form-modal__drag-handle"
                        title="Kéo để đổi thứ tự"
                        onDragStart={(event) => handleDragStart(event, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <HolderOutlined />
                      </span>

                      <span className="topping-group-form-modal__ordinal">
                        {index + 1}
                      </span>

                      <div className="topping-group-form-modal__selected-info">
                        <strong>{topping.toppingName}</strong>

                        <span>
                          {Number(topping.tapPrice ?? 0).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          ₫
                        </span>
                      </div>

                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        aria-label={`Bỏ ${topping.toppingName}`}
                        onClick={() => removeSelectedTopping(topping)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="topping-group-form-modal__empty">
                    Chưa chọn topping nào.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ================================
              RIGHT
          ================================ */}

          <section className="topping-group-form-modal__catalog">
            <div className="topping-group-form-modal__catalog-header">
              <div>
                <strong>Topping trong nhóm</strong>

                <span>Chọn topping có sẵn hoặc thêm topping mới.</span>
              </div>

              <SearchInput
                size="sm"
                allowClear
                value={searchText}
                placeholder="Tìm topping..."
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <div className="topping-group-form-modal__add">
              <AppInput
                value={newToppingName}
                maxLength={120}
                placeholder="Tên topping mới"
                onChange={(event) => {
                  /*
                   * Keep raw input while typing.
                   * addTopping() owns normalization / validation.
                   */
                  setNewToppingName(event.target.value);

                  setError("");
                }}
                onPressEnter={addTopping}
              />

              <AppInputNumber
                min={0}
                precision={0}
                value={newToppingPrice}
                placeholder="Giá"
                onChange={setNewToppingPrice}
              />

              <Button icon={<PlusOutlined />} onClick={addTopping}>
                Thêm
              </Button>
            </div>

            <div className="topping-group-form-modal__catalog-list">
              {filteredToppings.length > 0 ? (
                filteredToppings.map((topping, index) => {
                  const checked = topping.isActive !== false;

                  return (
                    <label
                      key={getToppingKey(topping, index)}
                      className={[
                        "topping-group-form-modal__catalog-row",

                        checked
                          ? "topping-group-form-modal__catalog-row--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(event) =>
                          toggleTopping(topping, event.target.checked)
                        }
                      />

                      <div>
                        <strong>{topping.toppingName}</strong>

                        <span>
                          {Number(topping.tapPrice ?? 0).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          ₫
                        </span>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="topping-group-form-modal__empty">
                  Không tìm thấy topping phù hợp.
                </div>
              )}
            </div>
          </section>
        </div>

        {error ? (
          <div className="topping-group-form-modal__error">{error}</div>
        ) : null}
      </div>
    </ManagementFormModal>
  );
}

ToppingGroupFormModal.propTypes = {
  open: PropTypes.bool.isRequired,

  mode: PropTypes.oneOf(["create", "edit"]),

  group: PropTypes.object,

  managerPhone: PropTypes.string,

  submitting: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

ToppingGroupFormModal.defaultProps = {
  mode: "create",
  group: null,
  managerPhone: "",
  submitting: false,
};

export default ToppingGroupFormModal;
