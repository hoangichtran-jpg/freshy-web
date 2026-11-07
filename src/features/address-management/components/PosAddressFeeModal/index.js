import React, { useEffect } from "react";

import PropTypes from "prop-types";

import { Form } from "antd";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";
import AppInputNumber from "../../../../shared/components/AppInputNumber";

import {
  formatMoneyInput,
  getNonNegativeMoneyValidationError,
  parseMoneyInput,
} from "../../../../shared/utils/money";

import "./PosAddressFeeModal.scss";

const moneyValidator = (_, value) => {
  const message = getNonNegativeMoneyValidationError(value);

  return message ? Promise.reject(new Error(message)) : Promise.resolve();
};

function PosAddressFeeModal({ open, record, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      return;
    }

    form.resetFields();

    form.setFieldsValue({
      feeShip: record?.feeShip ?? undefined,
    });
  }, [form, open, record]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await onSubmit(Number(values.feeShip));
    } catch (error) {
      if (error?.errorFields?.length) {
        return;
      }

      throw error;
    }
  };

  if (!record) {
    return null;
  }

  return (
    <ManagementFormModal
      open={open}
      width={500}
      title="Chỉnh sửa phí giao hàng"
      description="Cập nhật phí giao hàng áp dụng cho địa chỉ tại trung tâm hiện tại."
      loading={loading}
      primaryText="Lưu thay đổi"
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="pos-address-fee-modal">
        <div className="pos-address-fee-modal__summary">
          <div className="pos-address-fee-modal__summary-label">Địa chỉ</div>

          <div className="pos-address-fee-modal__summary-title">
            {record.address || "Chưa cập nhật địa chỉ"}
          </div>

          {record.unit ? (
            <div className="pos-address-fee-modal__summary-meta">
              Đơn vị: <strong>{record.unit}</strong>
            </div>
          ) : null}
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          validateTrigger={["onChange", "onBlur"]}
        >
          <Form.Item
            name="feeShip"
            label="Phí giao hàng"
            validateFirst
            rules={[
              {
                validator: moneyValidator,
              },
            ]}
          >
            <AppInputNumber
              size="lg"
              min={0}
              step={1000}
              precision={0}
              controls={false}
              formatter={formatMoneyInput}
              parser={parseMoneyInput}
              placeholder="Ví dụ: 10.000"
              addonAfter="VNĐ"
              className="pos-address-fee-modal__input"
            />
          </Form.Item>
        </Form>
      </div>
    </ManagementFormModal>
  );
}

PosAddressFeeModal.propTypes = {
  open: PropTypes.bool.isRequired,

  record: PropTypes.object,

  loading: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

PosAddressFeeModal.defaultProps = {
  record: null,

  loading: false,
};

export default PosAddressFeeModal;
