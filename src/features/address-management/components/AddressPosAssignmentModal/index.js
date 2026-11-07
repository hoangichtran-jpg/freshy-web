import React, { useEffect, useMemo } from "react";

import PropTypes from "prop-types";

import { Alert, Form } from "antd";

import AppSelect from "../../../../shared/components/AppSelect";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";
import AppInputNumber from "../../../../shared/components/AppInputNumber";

import {
  formatMoneyInput,
  getNonNegativeMoneyValidationError,
  parseMoneyInput,
} from "../../../../shared/utils/money";

import "./AddressPosAssignmentModal.scss";

const moneyValidator = (_, value) => {
  const message = getNonNegativeMoneyValidationError(value);

  return message ? Promise.reject(new Error(message)) : Promise.resolve();
};

function AddressPosAssignmentModal({
  open,

  address,

  kitchens,

  kitchensLoading,

  kitchensError,

  loading,

  onCancel,

  onSubmit,
}) {
  const [form] = Form.useForm();

  /* ========================================
     Current assignments
  ======================================== */

  const assignedPos = useMemo(
    () =>
      Array.isArray(address?.posInfo)
        ? address.posInfo.filter((pos) => pos?.posId != null)
        : [],
    [address],
  );

  /*
   * Giữ behavior legacy:
   * nếu backend trả POS hiện tại
   * thì preselect POS đầu tiên.
   */
  const initialPosId = useMemo(() => {
    const currentPosId = address?.posInfo?.[0]?.posId;

    if (currentPosId == null) {
      return undefined;
    }

    const stillAvailable = kitchens.some(
      (kitchen) => kitchen.value === currentPosId,
    );

    return stillAvailable ? currentPosId : undefined;
  }, [address, kitchens]);

  /* ========================================
     Initial values
  ======================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    form.resetFields();

    form.setFieldsValue({
      posId: initialPosId,

      shippingFee: address?.feeShip ?? undefined,
    });
  }, [address, form, initialPosId, open]);

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await onSubmit({
        posId: values.posId,

        shippingFee: Number(values.shippingFee),
      });
    } catch (error) {
      if (error?.errorFields?.length) {
        const firstField = error.errorFields[0]?.name;

        if (firstField) {
          form.scrollToField(firstField, {
            block: "center",
          });
        }

        return;
      }

      throw error;
    }
  };

  if (!address) {
    return null;
  }

  const noKitchens =
    !kitchensLoading && !kitchensError && kitchens.length === 0;

  const primaryDisabled =
    kitchensLoading || Boolean(kitchensError) || noKitchens;

  return (
    <ManagementFormModal
      open={open}
      width={560}
      title="Thêm địa chỉ vào trung tâm"
      description="Chọn trung tâm xử lý và thiết lập phí giao hàng cho địa chỉ."
      loading={loading}
      primaryText="Thêm vào trung tâm"
      primaryDisabled={primaryDisabled}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <div className="address-pos-assignment">
        <div className="address-pos-assignment__summary">
          <div className="address-pos-assignment__summary-label">Địa chỉ</div>

          <div className="address-pos-assignment__summary-title">
            {address.addressName || "Chưa cập nhật địa chỉ"}
          </div>

          {address.unit ? (
            <div className="address-pos-assignment__summary-meta">
              <span>
                Đơn vị: <strong>{address.unit}</strong>
              </span>
            </div>
          ) : null}
        </div>

        {assignedPos.length > 0 ? (
          <div className="address-pos-assignment__current">
            <span className="address-pos-assignment__current-label">
              Trung tâm hiện tại
            </span>

            <div className="address-pos-assignment__current-list">
              {assignedPos.map((pos) => (
                <span
                  key={pos.posId}
                  className="address-pos-assignment__current-pill"
                >
                  {pos.posName || `POS #${pos.posId}`}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {kitchensError ? (
          <Alert
            type="error"
            showIcon
            message="Không thể tải danh sách trung tâm"
            description="Danh sách trung tâm chưa tải được. Hãy đóng cửa sổ và thử lại."
            className="address-pos-assignment__alert"
          />
        ) : null}

        {noKitchens ? (
          <Alert
            type="warning"
            showIcon
            message="Chưa có trung tâm"
            description="Tài khoản quản lý hiện tại chưa có trung tâm để gán địa chỉ."
            className="address-pos-assignment__alert"
          />
        ) : null}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          validateTrigger={["onChange", "onBlur"]}
          className="address-pos-assignment__form"
        >
          <Form.Item
            name="posId"
            label="Trung tâm"
            rules={[
              {
                required: true,

                message: "Vui lòng chọn trung tâm.",
              },
            ]}
          >
            <AppSelect
              size="lg"
              showSearch
              loading={kitchensLoading}
              disabled={kitchensLoading || Boolean(kitchensError) || noKitchens}
              placeholder={
                kitchensLoading ? "Đang tải trung tâm..." : "Chọn trung tâm"
              }
              options={kitchens}
              optionFilterProp="label"
              className="address-pos-assignment__select"
            />
          </Form.Item>

          <Form.Item
            name="shippingFee"
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
              className="address-pos-assignment__fee"
            />
          </Form.Item>
        </Form>
      </div>
    </ManagementFormModal>
  );
}

AddressPosAssignmentModal.propTypes = {
  open: PropTypes.bool.isRequired,

  address: PropTypes.object,

  kitchens: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

      label: PropTypes.string,
    }),
  ),

  kitchensLoading: PropTypes.bool,

  kitchensError: PropTypes.any,

  loading: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

AddressPosAssignmentModal.defaultProps = {
  address: null,

  kitchens: [],

  kitchensLoading: false,

  kitchensError: null,

  loading: false,
};

export default AddressPosAssignmentModal;
