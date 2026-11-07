
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert, Button, Input, InputNumber,
  Segmented, Select, Table,
} from "antd";
import {
  CheckOutlined, MinusOutlined, PlusOutlined,
} from "@ant-design/icons";
import AppModal from "../../../../shared/components/AppModal";
import EmptyState from "../../../../shared/components/EmptyState";
import {
  buildInventoryChanges,
  createInventoryDraft,
  flattenInventoryToppings,
  validateInventoryDraft,
} from "../../utils/shiftInventoryEdit";
import "./EditInitialQuantityModal.scss";

function EditInitialQuantityModal({
  open, context, loading, onCancel, onSave,
}) {
  const [section, setSection] = useState("items");
  const [draft, setDraft] = useState([]);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && context) {
      setDraft(createInventoryDraft(context.items));
      setReason("");
      setSection("items");
    }
  }, [open, context]);

  const tops = useMemo(
    () => flattenInventoryToppings(draft), [draft]
  );
  const changes = useMemo(
    () => buildInventoryChanges(draft), [draft]
  );
  const error = useMemo(
    () => validateInventoryDraft(draft), [draft]
  );

  const count = changes.reduce(
    (n, i) =>
      n +
      Number(i.newInitialQuantity !== undefined) +
      Number(i.newQuantitative !== undefined) +
      (i.toppings || []).reduce(
        (x, t) =>
          x +
          Number(t.newQuantitative !== undefined) +
          Number(t.newTargetItemId !== undefined),
        0
      ),
    0
  );

  const itemOptions = draft.map((i) => ({
    value: i.itemId,
    label: i.itemName,
  }));
  const saveDisabled =
    loading || !count || !!error || !reason.trim();

  const editItem = (id, field, value) =>
    setDraft((prev) =>
      prev.map((i) =>
        String(i.itemId) === String(id)
          ? { ...i, [field]: value }
          : i
      )
    );

  const editTop = (
    itemId, groupId, toppingId, field, value
  ) =>
    setDraft((prev) =>
      prev.map((i) =>
        String(i.itemId) !== String(itemId)
          ? i
          : {
              ...i,
              toppingGroups: i.toppingGroups.map((g) =>
                String(g.toppingGroupId) !== String(groupId)
                  ? g
                  : {
                      ...g,
                      toppings: g.toppings.map((t) =>
                        String(t.toppingId) !== String(toppingId)
                          ? t
                          : { ...t, [field]: value }
                      ),
                    }
              ),
            }
      )
    );

  const itemColumns = [
    {
      title: "Món",
      dataIndex: "itemName",
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Số suất đầu ca",
      width: 210,
      render: (_, i) => (
        <div className="sales-quantity-modal__stepper">
          <Button
            type="text"
            icon={<MinusOutlined />}
            disabled={loading || i.initialQuantity <= 1}
            onClick={() => editItem(
              i.itemId, "initialQuantity",
              Number(i.initialQuantity) - 1
            )}
          />
          <InputNumber
            min={1}
            precision={0}
            controls={false}
            disabled={loading}
            className="sales-quantity-modal__input"
            aria-label={`Số suất ${i.itemName}`}
            value={i.initialQuantity}
            onChange={(v) => editItem(
              i.itemId, "initialQuantity", v
            )}
          />
          <Button
            type="text"
            icon={<PlusOutlined />}
            disabled={loading || i.initialQuantity == null}
            onClick={() => editItem(
              i.itemId, "initialQuantity",
              Number(i.initialQuantity) + 1
            )}
          />
        </div>
      ),
    },
    {
      title: "Còn lại",
      width: 100,
      align: "right",
      render: (_, i) => (
        <span className="sales-quantity-modal__read-only">
          {i.remainingQuantity}
        </span>
      ),
    },
    {
      title: "Định lượng",
      width: 135,
      render: (_, i) => (
        <InputNumber
          min={0.01}
          step={0.1}
          controls={false}
          disabled={loading}
          className="sales-quantity-modal__decimal-input"
          value={i.quantitative}
          aria-label={`Định lượng ${i.itemName}`}
          onChange={(v) => editItem(
            i.itemId, "quantitative", v
          )}
        />
      ),
    },
  ];

  const topColumns = [
    {
      title: "Món / Nhóm",
      width: 170,
      render: (_, t) => (
        <div className="sales-quantity-modal__topping-cell">
          <strong>{t.parentName}</strong>
          <small>{t.groupName}</small>
        </div>
      ),
    },
    {
      title: "Topping",
      render: (_, t) => <strong>{t.toppingName}</strong>,
    },
    {
      title: "Định lượng",
      width: 125,
      render: (_, t) => (
        <InputNumber
          min={0}
          step={0.1}
          controls={false}
          disabled={loading}
          className="sales-quantity-modal__decimal-input"
          value={t.quantitative}
          aria-label={`Định lượng ${t.toppingName}`}
          onChange={(v) => editTop(
            t.itemId, t.groupId, t.toppingId,
            "quantitative", v
          )}
        />
      ),
    },
    {
      title: "Trừ tồn món",
      width: 210,
      render: (_, t) => (
        <Select
          disabled={loading}
          showSearch
          optionFilterProp="label"
          className="sales-quantity-modal__target-select"
          aria-label={`Món chịu trừ tồn ${t.toppingName}`}
          value={t.targetItemId}
          options={itemOptions}
          onChange={(v) => editTop(
            t.itemId, t.groupId, t.toppingId,
            "targetItemId", v
          )}
        />
      ),
    },
  ];

  return (
    <AppModal
      open={open}
      width={1080}
      closable={!loading}
      maskClosable={false}
      keyboard={!loading}
      className="sales-quantity-modal"
      title={`Chỉnh tồn kho · ${
        context?.shiftName || `Ca #${context?.shiftId || ""}`
      }`}
      onCancel={onCancel}
      footer={
        <div className="sales-quantity-modal__footer">
          <span className="sales-quantity-modal__change-status">
            {count
              ? `${count} thay đổi chưa lưu`
              : "Chưa có thay đổi"}
          </span>
          <div className="sales-quantity-modal__footer-actions">
            <Button disabled={loading} onClick={onCancel}>
              Hủy
            </Button>
            <Button
              icon={<CheckOutlined />}
              loading={loading}
              disabled={saveDisabled}
              className="sales-quantity-modal__save"
              onClick={() => onSave(draft, reason.trim())}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      }
    >
      <div className="sales-quantity-modal__body">
        <div className="sales-quantity-modal__intro sales-quantity-modal__intro--sectioned">
          <p>
            Chỉ chỉnh ca đang mở. Thao tác được lưu
            trong lịch sử kiểm kê.
          </p>
          <Segmented
            disabled={loading}
            value={section}
            onChange={setSection}
            options={[
              {
                label: `Món (${draft.length})`,
                value: "items",
              },
              {
                label: `Topping (${tops.length})`,
                value: "tops",
              },
            ]}
          />
        </div>

        <div className="sales-quantity-modal__table-header">
          <h4 className="sales-quantity-modal__table-title">
            {section === "items"
              ? "Tồn kho và định lượng món"
              : "Topping và món chịu trừ tồn"}
          </h4>
        </div>

        <div
          className="sales-quantity-modal__table"
          key={section}
        >
          <Table
            dataSource={section === "items" ? draft : tops}
            rowKey={section === "items" ? "itemId" : "rowKey"}
            columns={
              section === "items" ? itemColumns : topColumns
            }
            size="small"
            pagination={false}
            scroll={{
              x: section === "items" ? 740 : 820,
              y: 9999,
            }}
            rowClassName={(r) =>
              section === "items"
                ? (
                    r.initialQuantity !==
                      r.originalInitialQuantity ||
                    r.quantitative !== r.originalQuantitative
                    ? "sales-quantity-modal__row--changed"
                    : ""
                  )
                : (
                    r.quantitative !== r.originalQuantitative ||
                    r.targetItemId !== r.originalTargetItemId
                    ? "sales-quantity-modal__row--changed"
                    : ""
                  )
            }
            locale={{
              emptyText: (
                <EmptyState
                  image="simple"
                  description="Không có dữ liệu trong ca"
                />
              ),
            }}
          />
        </div>

        <div className="sales-quantity-modal__reason">
          <label htmlFor="inventory-reason">
            Lý do chỉnh sửa <span>*</span>
          </label>
          <Input.TextArea
            id="inventory-reason"
            rows={2}
            maxLength={255}
            disabled={loading}
            value={reason}
            placeholder="Ví dụ: Kiểm kê bổ sung 1 suất"
            onChange={(e) => setReason(e.target.value)}
          />
          <span className="sales-quantity-modal__reason-help">
            {error ||
              (count && !reason.trim()
                ? "Nhập lý do trước khi lưu."
                : "Nếu tồn kho đã thay đổi, hệ thống sẽ yêu cầu tải lại dữ liệu.")}
          </span>
          {count > 0 && (
            <Alert
              type="info"
              showIcon
              message={`${count} trường sẽ được cập nhật khi lưu.`}
            />
          )}
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
