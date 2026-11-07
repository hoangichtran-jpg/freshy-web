import { useEffect } from "react";

import PropTypes from "prop-types";

import { Button, Form, Input } from "antd";

import AppModal from "../../../../../../shared/components/AppModal";

import { SaveOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

import ExactTimePicker, {
  parseTimeInput,
} from "../../../../../../shared/components/ExactTimePicker";

import AppInput from "../../../../../../shared/components/AppInput";

import {
  formatMoneyInput,
  getNonNegativeMoneyValidationError,
  parseMoneyInput,
} from "../../../../../../shared/utils/money";

import {
  MAX_PERSON_NAME_LENGTH,
  getPersonNameValidationError,
  getVietnamPhoneValidationError,
  normalizePersonName,
  normalizeVietnamPhoneInput,
} from "../../../../../../shared/utils/userInputValidation";

import "./OrderEditModal.scss";

/* ========================================
   Constants
======================================== */

const NOTE_MAX_LENGTH = 500;

/* ========================================
   Validation adapter
======================================== */

const createAntdValidator =
  (getError, { allowEmpty = false } = {}) =>
  (_, value) => {
    const isEmpty =
      value === null || value === undefined || String(value).trim() === "";

    if (allowEmpty && isEmpty) {
      return Promise.resolve();
    }

    const message = getError(value);

    return message ? Promise.reject(new Error(message)) : Promise.resolve();
  };

/* ========================================
   Helpers
======================================== */

const trimOptionalText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

/* ========================================
   Money input
======================================== */

function MoneyInput({ value, onChange, onBlur, disabled }) {
  const handleChange = (event) => {
    /*
     * Shared parser chỉ giữ digit.
     *
     * abc      -> undefined
     * 12abc3   -> 123
     * 100.000  -> 100000
     */
    const nextValue = parseMoneyInput(event.target.value);

    onChange?.(nextValue);
  };

  return (
    <div className="order-edit__money-field">
      <Input
        value={formatMoneyInput(value)}
        disabled={disabled}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        className="order-edit__money-input"
        onChange={handleChange}
        onBlur={onBlur}
      />

      <span className="order-edit__currency">₫</span>
    </div>
  );
}

MoneyInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  onChange: PropTypes.func,

  onBlur: PropTypes.func,

  disabled: PropTypes.bool,
};

MoneyInput.defaultProps = {
  value: undefined,
  onChange: undefined,
  onBlur: undefined,
  disabled: false,
};

/* ========================================
   Order Edit Modal
======================================== */

function OrderEditModal({ open, order, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  /* ========================================
     Sync form
  ======================================== */

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    form.setFieldsValue({
      totalPrice: order.totalPrice ?? 0,

      /*
       * ExactTimePicker dùng HH:mm string.
       */
      timeWanted: order.timeWanted
        ? dayjs(order.timeWanted).format("HH:mm")
        : "",

      agencyOrderName: order.agencyOrderName || "",

      agencyOrderPhone: order.agencyOrderPhone || "",

      note: order.note || "",

      specialNote: order.specialNote || "",
    });
  }, [form, open, order]);

  /* ========================================
     Submit
  ======================================== */

  const handleFinish = async (values) => {
    let normalizedTimeWanted = null;

    /*
     * UI dùng HH:mm string.
     *
     * Parent vẫn đang sử dụng
     * buildOrderUpdatePayload với Dayjs,
     * nên convert tại boundary.
     */
    if (values.timeWanted) {
      const parsed = parseTimeInput(values.timeWanted);

      if (parsed) {
        const [hour, minute] = values.timeWanted.split(":").map(Number);

        const baseTime = order?.timeWanted ? dayjs(order.timeWanted) : dayjs();

        normalizedTimeWanted = baseTime
          .hour(hour)
          .minute(minute)
          .second(0)
          .millisecond(0);
      }
    }

    const normalizedValues = {
      ...values,

      /*
       * Normalize tên lúc submit,
       * không normalize mỗi keystroke.
       */
      agencyOrderName: values.agencyOrderName
        ? normalizePersonName(values.agencyOrderName)
        : "",

      /*
       * Phone đã được normalize
       * bởi Form.Item.
       */
      agencyOrderPhone: values.agencyOrderPhone || "",

      note: trimOptionalText(values.note),

      specialNote: trimOptionalText(values.specialNote),

      timeWanted: normalizedTimeWanted,
    };

    await onSubmit?.(normalizedValues);
  };

  /* ========================================
     Close
  ======================================== */

  const handleCancel = () => {
    if (loading) {
      return;
    }

    onCancel?.();
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <AppModal
      open={open}
      width={720}
      footer={null}
      title={null}
      closable={!loading}
      maskClosable={false}
      keyboard={!loading}
      className="order-edit-modal"
      onCancel={handleCancel}
    >
      <div className="order-edit">
        {/* ========================================
            Header
        ======================================== */}

        <header className="order-edit__header">
          <div className="order-edit__heading">
            <span className="order-edit__eyebrow">Đơn hàng</span>

            <h2>Chỉnh sửa đơn hàng</h2>

            <p>Cập nhật thông tin giao nhận và thông tin khách hàng.</p>
          </div>

          {order?.orderId && (
            <div className="order-edit__order-id">#{order.orderId}</div>
          )}
        </header>

        {/* ========================================
            Form
        ======================================== */}

        <Form
          form={form}
          layout="vertical"
          requiredMark
          className="order-edit__form"
          onFinish={handleFinish}
        >
          <div className="order-edit__body">
            {/* ========================================
                Order information
            ======================================== */}

            <section className="order-edit__section">
              <div className="order-edit__section-heading">
                <h3>Thông tin đơn hàng</h3>

                <p>Các thông tin chính dùng trong quá trình xử lý đơn.</p>
              </div>

              <div className="order-edit__grid">
                {/* ========================================
                    Price
                ======================================== */}

                <Form.Item
                  label="Giá tiền"
                  name="totalPrice"
                  validateFirst
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    {
                      validator: (_, value) => {
                        const message = getNonNegativeMoneyValidationError(
                          value,
                          {
                            fieldLabel: "Giá tiền",

                            required: true,
                          },
                        );

                        return message
                          ? Promise.reject(new Error(message))
                          : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <MoneyInput disabled={loading} />
                </Form.Item>

                {/* ========================================
                    Receive time
                ======================================== */}

                <Form.Item
                  label="Thời gian nhận"
                  name="timeWanted"
                  validateFirst
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator: (_, value) => {
                        /*
                         * Giữ business behavior hiện tại:
                         * không bắt buộc phải có giờ.
                         *
                         * Nhưng nếu nhập thì phải đúng.
                         */
                        if (!value) {
                          return Promise.resolve();
                        }

                        const parsed = parseTimeInput(value);

                        if (!parsed) {
                          return Promise.reject(
                            new Error(
                              "Thời gian không hợp lệ. Vui lòng nhập theo định dạng HH:mm.",
                            ),
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <ExactTimePicker
                    disabled={loading}
                    placeholder="Ví dụ: 11:50"
                    className="order-edit__time-picker"
                  />
                </Form.Item>

                {/* ========================================
                    Customer name
                ======================================== */}

                <Form.Item
                  label="Tên khách hàng"
                  name="agencyOrderName"
                  validateFirst
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator: createAntdValidator(
                        getPersonNameValidationError,
                        {
                          allowEmpty: true,
                        },
                      ),
                    },
                  ]}
                >
                  <AppInput
                    disabled={loading}
                    maxLength={MAX_PERSON_NAME_LENGTH}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    autoComplete="name"
                  />
                </Form.Item>

                {/* ========================================
                    Phone
                ======================================== */}

                <Form.Item
                  label="Số điện thoại"
                  name="agencyOrderPhone"
                  normalize={normalizeVietnamPhoneInput}
                  validateFirst
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator: createAntdValidator(
                        getVietnamPhoneValidationError,
                        {
                          allowEmpty: true,
                        },
                      ),
                    },
                  ]}
                >
                  <AppInput
                    disabled={loading}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ví dụ: 0393500023"
                  />
                </Form.Item>
              </div>
            </section>

            {/* ========================================
                Notes
            ======================================== */}

            <section className="order-edit__section order-edit__section--notes">
              <div className="order-edit__section-heading">
                <h3>Ghi chú</h3>

                <p>Thông tin bổ sung dành cho nhân viên xử lý đơn.</p>
              </div>

              <div className="order-edit__notes">
                {/* ========================================
                    Order note
                ======================================== */}

                <Form.Item
                  label="Ghi chú đơn hàng"
                  name="note"
                  validateFirst
                  rules={[
                    {
                      max: NOTE_MAX_LENGTH,

                      message: `Ghi chú không được vượt quá ${NOTE_MAX_LENGTH} ký tự.`,
                    },
                  ]}
                >
                  <AppInput.TextArea
                    disabled={loading}
                    maxLength={NOTE_MAX_LENGTH}
                    showCount
                    autoSize={{
                      minRows: 3,

                      maxRows: 5,
                    }}
                    placeholder="Ví dụ: giao tại quầy lễ tân..."
                  />
                </Form.Item>

                {/* ========================================
                    Special note
                ======================================== */}

                <Form.Item
                  label={
                    <span className="order-edit__special-label">
                      Chú ý đặc biệt
                      <span>Quan trọng</span>
                    </span>
                  }
                  name="specialNote"
                  className="order-edit__special-field"
                  validateFirst
                  rules={[
                    {
                      max: NOTE_MAX_LENGTH,

                      message: `Chú ý đặc biệt không được vượt quá ${NOTE_MAX_LENGTH} ký tự.`,
                    },
                  ]}
                >
                  <AppInput.TextArea
                    disabled={loading}
                    maxLength={NOTE_MAX_LENGTH}
                    showCount
                    autoSize={{
                      minRows: 3,

                      maxRows: 5,
                    }}
                    placeholder="Thông tin cần đặc biệt lưu ý khi xử lý đơn..."
                  />
                </Form.Item>
              </div>
            </section>
          </div>

          {/* ========================================
              Footer
          ======================================== */}

          <footer className="order-edit__footer">
            <p>Kiểm tra lại thông tin trước khi lưu.</p>

            <div className="order-edit__actions">
              <Button
                disabled={loading}
                className="order-edit__cancel"
                onClick={handleCancel}
              >
                Hủy
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="order-edit__submit"
              >
                Lưu thay đổi
              </Button>
            </div>
          </footer>
        </Form>
      </div>
    </AppModal>
  );
}

OrderEditModal.propTypes = {
  open: PropTypes.bool,

  order: PropTypes.object,

  loading: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

OrderEditModal.defaultProps = {
  open: false,
  order: null,
  loading: false,
};

export default OrderEditModal;
