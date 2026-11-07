import React, { useEffect } from "react";

import PropTypes from "prop-types";

import { DatePicker, Form } from "antd";

import PhoneInput from "react-phone-input-2";

import "react-phone-input-2/lib/style.css";

import dayjs from "dayjs";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";
import AppInput from "../../../../shared/components/AppInput";

import {
  MAX_PERSON_NAME_LENGTH,
  getPersonNameValidationError,
  getVietnamPhoneValidationError,
  normalizePersonName,
  normalizeVietnamPhoneNumber,
} from "../../../../shared/utils/userInputValidation";

import {
  getUserManagementTypeConfig,
  USER_MANAGEMENT_TYPES,
} from "../../constants";

import "./ManagedUserFormModal.scss";

const MIN_PASSWORD_LENGTH = 8;

const MAX_PASSWORD_LENGTH = 64;

/* ========================================
   AntD validator adapter
======================================== */

/*
 * Shared validation chỉ trả string lỗi.
 *
 * Component này mới chịu trách nhiệm
 * chuyển nó sang Promise format
 * mà Ant Design Form yêu cầu.
 */
const createAntdValidator = (getError) => (_, value) => {
  const message = getError(value);

  if (message) {
    return Promise.reject(new Error(message));
  }

  return Promise.resolve();
};

/* ========================================
   Component
======================================== */

function ManagedUserFormModal({
  open,
  mode,
  type,
  user,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  const config = getUserManagementTypeConfig(type);

  const isCreate = mode === "create";

  /* ========================================
     Initial values
  ======================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    form.resetFields();

    if (mode === "edit" && user) {
      form.setFieldsValue({
        phoneNumber: user.phoneNumber || "",

        firstName: user.firstName || "",

        lastName: user.lastName || "",

        birthday: user.birthday ? dayjs(user.birthday) : null,

        addressDetail: user.addressDetail || user.address || "",
      });
    }
  }, [form, mode, open, user]);

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      /*
       * confirmPassword chỉ phục vụ
       * validation UI.
       *
       * Không gửi xuống hook/API.
       */
      const { confirmPassword, ...formValues } = values;

      await onSubmit({
        ...formValues,

        firstName: String(formValues.firstName || "").trim(),

        lastName: String(formValues.lastName || "").trim(),

        /*
         * Edit không được phép đổi phone,
         * vì phoneNumber đang là identifier
         * của backend contract hiện tại.
         */
        phoneNumber: isCreate
          ? normalizeVietnamPhoneNumber(formValues.phoneNumber)
          : user?.phoneNumber,

        birthday: formValues.birthday
          ? formValues.birthday.format("YYYY-MM-DD")
          : null,

        addressDetail: String(formValues.addressDetail || "").trim(),
      });
    } catch (error) {
      /*
       * AntD validation error.
       */
      if (error?.errorFields?.length) {
        const firstErrorField = error.errorFields[0]?.name;

        if (firstErrorField) {
          form.scrollToField(firstErrorField, {
            block: "center",
          });
        }

        return;
      }

      /*
       * API/business error phải throw
       * ngược lên page để AppToast xử lý.
       */
      throw error;
    }
  };

  if (!config) {
    return null;
  }

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementFormModal
      open={open}
      width={560}
      title={isCreate ? config.createTitle : config.editTitle}
      description={
        isCreate
          ? `Tạo tài khoản ${config.entityLabel} mới thuộc quản lý hiện tại.`
          : "Cập nhật thông tin cơ bản của người dùng."
      }
      loading={loading}
      primaryText={isCreate ? "Thêm người dùng" : "Lưu thay đổi"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        validateTrigger={["onChange", "onBlur"]}
        className="managed-user-form"
      >
        {/* ========================================
            Phone
        ======================================== */}

        {isCreate ? (
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            normalize={normalizeVietnamPhoneNumber}
            validateFirst
            rules={[
              {
                validator: createAntdValidator(getVietnamPhoneValidationError),
              },
            ]}
            extra="Số điện thoại sẽ được sử dụng để đăng nhập."
          >
            <PhoneInput
              country="vn"
              countryCodeEditable={false}
              enableSearch={false}
              containerClass="managed-user-form__phone-container"
              inputClass="managed-user-form__phone-input"
              buttonClass="managed-user-form__phone-button"
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            extra="Số điện thoại là định danh tài khoản nên không thể chỉnh sửa."
          >
            <AppInput disabled className="managed-user-form__input" />
          </Form.Item>
        )}

        {/* ========================================
            Name
        ======================================== */}

        <div className="managed-user-form__grid">
          <Form.Item
            name="firstName"
            label="Họ"
            normalize={normalizePersonName}
            validateFirst
            rules={[
              {
                validator: createAntdValidator((value) =>
                  getPersonNameValidationError(value, "họ"),
                ),
              },
            ]}
          >
            <AppInput
              maxLength={MAX_PERSON_NAME_LENGTH}
              placeholder="Nhập họ"
              className="managed-user-form__input"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Tên"
            normalize={normalizePersonName}
            validateFirst
            rules={[
              {
                validator: createAntdValidator((value) =>
                  getPersonNameValidationError(value, "tên"),
                ),
              },
            ]}
          >
            <AppInput
              maxLength={MAX_PERSON_NAME_LENGTH}
              placeholder="Nhập tên"
              className="managed-user-form__input"
            />
          </Form.Item>
        </div>

        {/* ========================================
            Create fields
        ======================================== */}

        {isCreate ? (
          <>
            <Form.Item
              name="password"
              label="Mật khẩu"
              validateFirst
              rules={[
                {
                  required: true,

                  message: "Vui lòng nhập mật khẩu.",
                },

                {
                  min: MIN_PASSWORD_LENGTH,

                  message: `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
                },

                {
                  max: MAX_PASSWORD_LENGTH,

                  message: `Mật khẩu không được vượt quá ${MAX_PASSWORD_LENGTH} ký tự.`,
                },
              ]}
              extra={`Mật khẩu cần từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự.`}
            >
              <AppInput.Password
                autoComplete="new-password"
                placeholder="Nhập mật khẩu"
                className="managed-user-form__input"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              validateFirst
              rules={[
                {
                  required: true,

                  message: "Vui lòng nhập lại mật khẩu.",
                },

                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp."),
                    );
                  },
                }),
              ]}
              extra="Nhập lại mật khẩu để xác nhận."
            >
              <AppInput.Password
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                className="managed-user-form__input"
              />
            </Form.Item>
          </>
        ) : (
          <>
            {/* ========================================
                Edit fields
            ======================================== */}

            <Form.Item name="birthday" label="Ngày sinh">
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                className="managed-user-form__date"
                disabledDate={(current) =>
                  Boolean(current && current > dayjs().endOf("day"))
                }
              />
            </Form.Item>

            <Form.Item
              name="addressDetail"
              label="Địa chỉ"
              rules={[
                {
                  max: 255,

                  message: "Địa chỉ không được vượt quá 255 ký tự.",
                },
              ]}
            >
              <AppInput.TextArea
                rows={3}
                maxLength={255}
                showCount
                placeholder="Nhập địa chỉ"
                className="managed-user-form__textarea"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </ManagementFormModal>
  );
}

/* ========================================
   PropTypes
======================================== */

ManagedUserFormModal.propTypes = {
  open: PropTypes.bool.isRequired,

  mode: PropTypes.oneOf(["create", "edit"]).isRequired,

  type: PropTypes.oneOf([
    USER_MANAGEMENT_TYPES.AGENCY,
    USER_MANAGEMENT_TYPES.SHIPPER,
  ]).isRequired,

  user: PropTypes.object,

  loading: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

ManagedUserFormModal.defaultProps = {
  user: null,

  loading: false,
};

export default ManagedUserFormModal;
