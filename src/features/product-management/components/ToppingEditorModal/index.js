import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Input, InputNumber } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

import AppButton from "../../../../shared/components/AppButton";

import { getBusinessTextValidationError, normalizeBusinessText } from "../../../../shared/utils/businessTextValidation";

import SearchInput from "../../../../shared/components/SearchInput";

import "./ToppingEditorModal.scss";

function ToppingEditorModal({ open, group, submitting, onCancel, onSubmit }) {
  const [toppings, setToppings] = useState([]);

  const [edited, setEdited] = useState([]);

  const [deleted, setDeleted] = useState([]);

  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [tempName, setTempName] = useState("");

  const [tempPrice, setTempPrice] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setToppings(
      Array.isArray(group?.toppings)
        ? group.toppings
            .filter(
              (topping) =>
                topping.isActive !== false && topping.toppingId != null,
            )
            .map((topping) => ({
              ...topping,
            }))
        : [],
    );

    setEdited([]);

    setDeleted([]);

    setQuery("");

    setEditingId(null);

    setTempName("");

    setTempPrice(null);

    setError("");
  }, [open, group]);

  const filteredToppings = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");

    return toppings
      .filter((topping) =>
        String(topping.toppingName || "")
          .toLocaleLowerCase("vi")
          .includes(normalized),
      )
      .slice()
      .sort((first, second) =>
        String(first.toppingName || "").localeCompare(
          String(second.toppingName || ""),
          "vi",
        ),
      );
  }, [toppings, query]);

  const startEdit = (topping) => {
    setEditingId(topping.toppingId);

    setTempName(topping.toppingName || "");

    setTempPrice(Number(topping.tapPrice ?? 0));

    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);

    setTempName("");

    setTempPrice(null);
  };

  const saveEdit = (topping) => {
    const name = normalizeBusinessText(tempName);

    const nameError = getBusinessTextValidationError(tempName, {
      fieldLabel: "Tên topping",

      maxLength: 120,
    });

    const price = Number(tempPrice);

    if (nameError) {
      setError(nameError);

      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá topping chưa hợp lệ.");

      return;
    }

    const duplicated = toppings.some(
      (current) =>
        current.toppingId !== topping.toppingId &&
        normalizeBusinessText(current.toppingName).toLocaleLowerCase("vi") ===
          name.toLocaleLowerCase("vi"),
    );

    if (duplicated) {
      setError("Tên topping này đã tồn tại.");

      return;
    }

    const updated = {
      ...topping,

      toppingName: name,

      tapPrice: price,
    };

    setToppings((previous) =>
      previous.map((current) =>
        current.toppingId === topping.toppingId ? updated : current,
      ),
    );

    setEdited((previous) => {
      const exists = previous.some(
        (current) => current.toppingId === topping.toppingId,
      );

      if (exists) {
        return previous.map((current) =>
          current.toppingId === topping.toppingId ? updated : current,
        );
      }

      return [...previous, updated];
    });

    cancelEdit();
  };

  const deleteTopping = (topping) => {
    setToppings((previous) =>
      previous.filter((current) => current.toppingId !== topping.toppingId),
    );

    setDeleted((previous) =>
      previous.includes(topping.toppingId)
        ? previous
        : [...previous, topping.toppingId],
    );

    setEdited((previous) =>
      previous.filter((current) => current.toppingId !== topping.toppingId),
    );

    if (editingId === topping.toppingId) {
      cancelEdit();
    }
  };

  const handleSubmit = () => {
    if (edited.length === 0 && deleted.length === 0) {
      onCancel();

      return;
    }

    const payload = {};

    if (edited.length > 0) {
      payload.edited = edited.map((topping) => ({
        toppingId: topping.toppingId,

        name: topping.toppingName,

        tapPrice: Number(topping.tapPrice ?? 0),

        otsPrice: topping.otsPrice ?? null,
      }));
    }

    if (deleted.length > 0) {
      payload.delete = deleted;
    }

    onSubmit(payload);
  };

  return (
    <AppModal
      open={open}
      width={680}
      footer={null}
      closable={!submitting}
      maskClosable={!submitting}
      keyboard={!submitting}
      className="topping-editor-modal"
      onCancel={onCancel}
    >
      <div className="topping-editor-modal__header">
        <h2 className="topping-editor-modal__title">Quản lý topping</h2>

        <p className="topping-editor-modal__subtitle">
          {group?.name
            ? `Chỉnh sửa tên, giá hoặc xóa topping trong "${group.name}".`
            : "Chỉnh sửa topping trong nhóm."}
        </p>
      </div>

      <div className="topping-editor-modal__body">
        <SearchInput
          size="md"
          allowClear
          value={query}
          placeholder="Tìm topping..."
          className="topping-editor-modal__search"
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="topping-editor-modal__list">
          {filteredToppings.length > 0 ? (
            filteredToppings.map((topping) => {
              const editing = editingId === topping.toppingId;

              return (
                <div
                  key={topping.toppingId}
                  className="topping-editor-modal__row"
                >
                  {editing ? (
                    <>
                      <Input
                        autoFocus
                        maxLength={120}
                        value={tempName}
                        className="topping-editor-modal__name-input"
                        onChange={(event) => setTempName(event.target.value)}
                      />

                      <InputNumber
                        min={0}
                        precision={0}
                        value={tempPrice}
                        className="topping-editor-modal__price-input"
                        onChange={setTempPrice}
                      />

                      <div className="topping-editor-modal__row-actions">
                        <Button
                          type="text"
                          icon={<CheckOutlined />}
                          className="topping-editor-modal__save"
                          onClick={() => saveEdit(topping)}
                        />

                        <Button
                          type="text"
                          icon={<CloseOutlined />}
                          className="topping-editor-modal__cancel-edit"
                          onClick={cancelEdit}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="topping-editor-modal__info">
                        <strong>{topping.toppingName}</strong>

                        <span>
                          {Number(topping.tapPrice ?? 0).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          ₫
                        </span>
                      </div>

                      <div className="topping-editor-modal__row-actions">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          className="topping-editor-modal__edit"
                          onClick={() => startEdit(topping)}
                        />

                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          className="topping-editor-modal__delete"
                          onClick={() => deleteTopping(topping)}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="topping-editor-modal__empty">
              Không có topping phù hợp.
            </div>
          )}
        </div>

        {deleted.length > 0 ? (
          <div className="topping-editor-modal__delete-note">
            {deleted.length} topping sẽ bị xóa khi bạn lưu thay đổi.
          </div>
        ) : null}

        {error ? (
          <div className="topping-editor-modal__error">{error}</div>
        ) : null}
      </div>

      <div className="topping-editor-modal__footer">
        <Button
          disabled={submitting}
          className="topping-editor-modal__cancel"
          onClick={onCancel}
        >
          Hủy
        </Button>

        <AppButton loading={submitting} onClick={handleSubmit}>
          Lưu thay đổi
        </AppButton>
      </div>
    </AppModal>
  );
}

ToppingEditorModal.propTypes = {
  open: PropTypes.bool.isRequired,

  group: PropTypes.object,

  submitting: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

ToppingEditorModal.defaultProps = {
  group: null,
  submitting: false,
};

export default ToppingEditorModal;
