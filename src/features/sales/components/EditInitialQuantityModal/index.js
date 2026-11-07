import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Input } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import AppModal from "../../../../shared/components/AppModal";
import AppButton from "../../../../shared/components/AppButton";
import InventoryItemCards from "../../../shift-inventory/components/InventoryItemCards";

import {
  createInventoryDraft,
  buildInventoryChanges,
  validateInventoryDraft,
} from "../../utils/shiftInventoryEdit";

import "./EditInitialQuantityModal.scss";

function EditInitialQuantityModal({
  open,
  context,
  loading,
  onCancel,
  onSave,
}) {
  const [draft, setDraft] = useState([]);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && context) {
      setDraft(createInventoryDraft(context.items || []));
      setReason("");
    }
  }, [open, context]);

  const changes = useMemo(
    () => buildInventoryChanges(draft),
    [draft]
  );
  const error = useMemo(
    () => validateInventoryDraft(draft),
    [draft]
  );

  const count = changes.reduce(
    (n, item) =>
      n +
      Number(item.newInitialQuantity !== undefined) +
      Number(item.newQuantitative !== undefined) +
      (item.toppings || []).reduce(
        (t, top) =>
          t +
          Number(top.newQuantitative !== undefined) +
          Number(top.newTargetItemId !== undefined),
        0
      ),
    0
  );

  const onItemChange = (id, field, value) =>
    setDraft((prev) =>
      prev.map((item) =>
        String(item.itemId) === String(id)
          ? { ...item, [field]: value }
          : item
      )
    );

  const onToppingChange = (
    id,
    groupId,
    toppingId,
    field,
    value
  ) =>
    setDraft((prev) =>
      prev.map((item) =>
        String(item.itemId) !== String(id)
          ? item
          : {
              ...item,
              toppingGroups: item.toppingGroups.map((group) =>
                String(group.toppingGroupId) !== String(groupId)
                  ? group
                  : {
                      ...group,
                      toppings: group.toppings.map((top) =>
                        String(top.toppingId) !== String(toppingId)
                          ? top
                          : { ...top, [field]: value }
                      ),
                    }
              ),
            }
      )
    );

  const items = draft.map((item) => ({
    ...item,
    toppingGroups: item.toppingGroups.map((group) => ({
      ...group,
      groupId: group.toppingGroupId,
    })),
  }));

  const canSave =
    count > 0 &&
    !error &&
    reason.trim() &&
    reason.trim().length <= 255 &&
    !loading;

  return (
    <AppModal
      open={open}
      width={1140}
      closable={!loading}
      keyboard={!loading}
      maskClosable={false}
      wrapClassName="shift-inventory-modal shift-inventory-edit-modal"
      title={
        <div className="shift-inventory-modal__heading">
          <div className="shift-inventory-modal__title">
            Chỉnh sửa tồn kho
          </div>
          <div className="shift-inventory-modal__step">
            Ca #{context?.shiftId || "—"}
          </div>
        </div>
      }
      onCancel={loading ? undefined : onCancel}
      footer={
        <div className="shift-inventory-modal__footer">
          <Button
            disabled={loading}
            onClick={onCancel}
            className="shift-inventory-modal__back"
          >
            Hủy
          </Button>
          <AppButton
            loading={loading}
            disabled={!canSave}
            onClick={() => onSave(draft, reason.trim())}
          >
            Lưu thay đổi
          </AppButton>
        </div>
      }
    >
      <div className="shift-inventory-modal__body">
        <div className="shift-inventory-modal__intro">
          <div className="shift-inventory-modal__intro-icon">
            <InfoCircleOutlined />
          </div>
          <div>
            <strong>Chỉnh số suất và định lượng ca đang mở</strong>
            <span>
              Topping nằm ngay dưới từng món. Tồn còn lại chỉ
              để theo dõi; mọi chỉnh sửa được ghi lịch sử.
            </span>
          </div>
        </div>

        <InventoryItemCards
          mode="edit"
          loading={loading}
          items={items}
          onItemChange={onItemChange}
          onToppingChange={onToppingChange}
        />

        <div className="inventory-edit__reason">
          <label htmlFor="inventory-edit-reason">
            Lý do chỉnh sửa *
          </label>
          <Input.TextArea
            id="inventory-edit-reason"
            rows={2}
            maxLength={255}
            disabled={loading}
            value={reason}
            placeholder="Ví dụ: Kiểm kê bổ sung 1 suất"
            onChange={(e) => setReason(e.target.value)}
          />

          {count > 0 && (
            <span className="inventory-edit__count">
              {count} thay đổi chưa lưu
            </span>
          )}
          {error ? (
            <Alert type="error" showIcon message={error} />
          ) : count > 0 && !reason.trim() ? (
            <span>Nhập lý do để lưu {count} thay đổi.</span>
          ) : null}
        </div>
      </div>
    </AppModal>
  );
}

EditInitialQuantityModal.propTypes = {
  open: PropTypes.bool.isRequired,
  context: PropTypes.object,
  loading: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditInitialQuantityModal;
