import React, { useCallback, useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Form } from "antd";

import AppSelect from "../../../../shared/components/AppSelect";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";
import AppInput from "../../../../shared/components/AppInput";

import {
  MAX_PERSON_NAME_LENGTH,
  getPersonNameValidationError,
  getVietnamPhoneValidationError,
  normalizePersonName,
  normalizeVietnamPhoneInput,
  normalizeVietnamPhoneNumber,
} from "../../../../shared/utils/userInputValidation";

import { PAYMENT_TYPE_OPTIONS } from "../../constants";

import AgencySelect from "./AgencySelect";

import ExactTimePicker, {
  parseTimeInput,
} from "../../../../shared/components/ExactTimePicker";

import "./AddressOrderInfoModal.scss";

/* ========================================
   Constants
======================================== */

const NOTE_MAX_LENGTH = 300;

/* ========================================
   Validator adapter
======================================== */

const createAntdValidator = (getError) => (_, value) => {
  const message = getError(value);

  if (message) {
    return Promise.reject(new Error(message));
  }

  return Promise.resolve();
};

/* ========================================
   Helpers
======================================== */

const getAgencyName = (agency) =>
  [agency?.firstName, agency?.lastName].filter(Boolean).join(" ").trim();

/*
 * Backend có thể trả:
 *
 * 11:05
 * hoặc:
 * 11:05:00
 *
 * UI chỉ hiển thị HH:mm.
 */
const normalizeInitialTime = (value) => {
  if (!value) {
    return undefined;
  }

  const parts = String(value).trim().split(":");

  if (parts.length < 2) {
    return undefined;
  }

  const hour = Number(parts[0]);

  const minute = Number(parts[1]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

/* ========================================
   Component
======================================== */

function AddressOrderInfoModal({
  open,
  address,
  agencies,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  const [editing, setEditing] = useState(false);

  const hasAgency = address?.agencyId != null;

  const viewOnly = hasAgency && !editing;

  /* ========================================
     Agency options
  ======================================== */

  const agencyOptions = useMemo(
    () =>
      agencies
        .filter((agency) => agency?.agencyId != null)
        .map((agency) => {
          const name = getAgencyName(agency);

          const phone = agency?.phoneNumber || "";

          return {
            value: agency.agencyId,

            label: name || phone || `Đại lý #${agency.agencyId}`,

            phone,

            searchText: [name, phone]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase("vi"),
          };
        }),
    [agencies],
  );

  /* ========================================
     Initial values
  ======================================== */

  const getInitialValues = useCallback(
    () => ({
      agencyId: address?.agencyId ?? undefined,

      orderName: address?.agencyOrderName || "",

      orderPhone: normalizeVietnamPhoneInput(address?.agencyOrderPhone || ""),

      paymentType: address?.paymentType || undefined,

      timeReceive: normalizeInitialTime(address?.timeReceive),

      note: address?.note || "",
    }),
    [address],
  );

  const resetForm = useCallback(() => {
    form.resetFields();

    form.setFieldsValue(getInitialValues());
  }, [form, getInitialValues]);

  /* ========================================
     Sync modal state
  ======================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * Chưa có agency:
     * mở modal ở edit mode.
     *
     * Đã có agency:
     * mặc định view mode.
     */
    setEditing(!hasAgency);

    resetForm();
  }, [hasAgency, open, resetForm]);

  /* ========================================
     Cancel
  ======================================== */

  const handleCancel = () => {
    if (loading) {
      return;
    }

    /*
     * Nếu đang chỉnh sửa một address
     * đã được thiết lập:
     *
     * Cancel chỉ bỏ thay đổi
     * và quay về view mode.
     */
    if (hasAgency && editing) {
      resetForm();

      setEditing(false);

      return;
    }

    onCancel();
  };

  /* ========================================
     Primary action
  ======================================== */

  const handlePrimaryAction = async () => {
    /*
     * View mode:
     * chỉ chuyển sang edit mode.
     */
    if (viewOnly) {
      setEditing(true);

      return;
    }

    try {
      const values = await form.validateFields();

      /*
       * Normalize lần cuối
       * trước khi tạo payload.
       */
      const normalizedReceiveTime = parseTimeInput(values.timeReceive);

      await onSubmit({
        agencyId: values.agencyId,

        orderName: String(values.orderName || "").trim(),

        orderPhone: normalizeVietnamPhoneNumber(values.orderPhone),

        paymentType: values.paymentType,

        /*
         * UI: HH:mm
         * Backend hiện tại: HH:mm:ss
         */
        timeReceive: normalizedReceiveTime
          ? `${normalizedReceiveTime}:00`
          : null,

        note: String(values.note || "").trim(),
      });
    } catch (error) {
      /*
       * Validation error của Ant Design.
       */
      if (error?.errorFields?.length) {
        const firstField = error.errorFields[0]?.name;

        if (firstField) {
          form.scrollToField(firstField, {
            block: "center",
          });
        }

        return;
      }

      /*
       * API error thật:
       * bubble lên caller.
       */
      throw error;
    }
  };

  /* ========================================
     Guard
  ======================================== */

  if (!address) {
    return null;
  }

  /* ========================================
     Button text
  =======================z================= */

  const primaryText = viewOnly
    ? "Chỉnh sửa"
    : hasAgency
      ? "Lưu thay đổi"
      : "Thiết lập thông tin";

  const cancelText = viewOnly ? "Đóng" : hasAgency ? "Hủy chỉnh sửa" : "Hủy";

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementFormModal
      open={open}
      width={680}
      title="Thông tin đặt hàng"
      description="Thiết lập đại lý, người nhận, thanh toán và thời gian giao nhận."
      loading={loading}
      primaryText={primaryText}
      cancelText={cancelText}
      onCancel={handleCancel}
      onSubmit={handlePrimaryAction}
    >
      <div className="address-order-info">
        {/* ========================================
            Address summary
        ======================================== */}

        <div className="address-order-info__summary">
          <span className="address-order-info__summary-label">
            Địa chỉ giao hàng
          </span>

          <strong className="address-order-info__summary-address">
            {address.addressName || "Chưa cập nhật địa chỉ"}
          </strong>

          {address.unit ? (
            <span className="address-order-info__summary-unit">
              {address.unit}
            </span>
          ) : null}
        </div>

        {/* ========================================
            Form
        ======================================== */}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          validateTrigger={["onChange", "onBlur"]}
          className="address-order-info__form"
        >
          {/* ========================================
              Section: Agency
          ======================================== */}

          <section className="address-order-info__section">
            <div className="address-order-info__section-header">
              <h3 className="address-order-info__section-title">Đại lý</h3>
            </div>

            <div className="address-order-info__section-body">
              <Form.Item
                name="agencyId"
                className="address-order-info__field address-order-info__field--last"
                rules={[
                  {
                    required: true,

                    message: "Vui lòng chọn đại lý.",
                  },
                ]}
              >
                <AgencySelect
                  disabled={viewOnly}
                  options={agencyOptions}
                  placeholder="Chọn đại lý"
                  className="address-order-info__control"
                />
              </Form.Item>
            </div>
          </section>

          {/* ========================================
              Section: Receiver
          ======================================== */}

          <section className="address-order-info__section">
            <div className="address-order-info__section-header">
              <h3 className="address-order-info__section-title">
                Thông tin người nhận
              </h3>
            </div>

            <div className="address-order-info__section-body">
              <div className="address-order-info__grid">
                {/* Receiver name */}

                <Form.Item
                  name="orderName"
                  label="Tên người nhận"
                  normalize={normalizePersonName}
                  validateFirst
                  rules={[
                    {
                      validator: createAntdValidator((value) =>
                        getPersonNameValidationError(value, "tên người nhận"),
                      ),
                    },
                  ]}
                >
                  <AppInput
                    disabled={viewOnly}
                    maxLength={MAX_PERSON_NAME_LENGTH}
                    autoComplete="name"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="address-order-info__control"
                  />
                </Form.Item>

                {/* Receiver phone */}

                <Form.Item
                  name="orderPhone"
                  label="Số điện thoại người nhận"
                  normalize={normalizeVietnamPhoneInput}
                  validateFirst
                  rules={[
                    {
                      validator: createAntdValidator(
                        getVietnamPhoneValidationError,
                      ),
                    },
                  ]}
                >
                  <AppInput
                    disabled={viewOnly}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ví dụ: 0942121298"
                    className="address-order-info__control"
                  />
                </Form.Item>
              </div>
            </div>
          </section>

          {/* ========================================
              Section: Order setup
          ======================================== */}

          <section className="address-order-info__section">
            <div className="address-order-info__section-header">
              <h3 className="address-order-info__section-title">
                Thiết lập đơn hàng
              </h3>
            </div>

            <div className="address-order-info__section-body">
              <div className="address-order-info__grid">
                {/* Payment */}

                <Form.Item
                  name="paymentType"
                  label="Phương thức thanh toán"
                  rules={[
                    {
                      required: true,

                      message: "Vui lòng chọn phương thức thanh toán.",
                    },
                  ]}
                >
                  <AppSelect
                    size="lg"
                    disabled={viewOnly}
                    placeholder="Chọn phương thức"
                    options={PAYMENT_TYPE_OPTIONS}
                    placement="bottomLeft"
                    popupMatchSelectWidth
                    className="address-order-info__control address-order-info__select"
                    popupClassName="address-order-info__dropdown"
                  />
                </Form.Item>

                {/* Receive time */}

                <Form.Item
                  name="timeReceive"
                  label="Giờ nhận"
                  validateTrigger="onBlur"
                  rules={[
                    {
                      required: true,

                      message: "Vui lòng nhập giờ nhận.",
                    },

                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }

                        const parsed = parseTimeInput(value);

                        if (!parsed) {
                          return Promise.reject(
                            new Error(
                              "Giờ nhận không hợp lệ. Vui lòng nhập theo định dạng HH:mm.",
                            ),
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <ExactTimePicker
                    disabled={viewOnly}
                    placeholder="Ví dụ: 11:05"
                    className="address-order-info__control address-order-info__time-select"
                  />
                </Form.Item>
              </div>

              {/* Note */}

              <Form.Item
                name="note"
                label="Ghi chú"
                className="address-order-info__note-field address-order-info__field--last"
                rules={[
                  {
                    max: NOTE_MAX_LENGTH,

                    message: `Ghi chú không được vượt quá ${NOTE_MAX_LENGTH} ký tự.`,
                  },
                ]}
              >
                <AppInput.TextArea
                  disabled={viewOnly}
                  rows={3}
                  maxLength={NOTE_MAX_LENGTH}
                  showCount={!viewOnly}
                  placeholder="Ví dụ: Gọi trước khi giao..."
                  className="address-order-info__textarea"
                />
              </Form.Item>
            </div>
          </section>
        </Form>
      </div>
    </ManagementFormModal>
  );
}

/* ========================================
   PropTypes
======================================== */

AddressOrderInfoModal.propTypes = {
  open: PropTypes.bool.isRequired,

  address: PropTypes.object,

  agencies: PropTypes.arrayOf(PropTypes.object),

  loading: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

AddressOrderInfoModal.defaultProps = {
  address: null,

  agencies: [],

  loading: false,
};

export default AddressOrderInfoModal;
