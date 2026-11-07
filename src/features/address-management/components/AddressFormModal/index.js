import React, { useEffect } from "react";

import PropTypes from "prop-types";

import { Form } from "antd";

import AppSelect from "../../../../shared/components/AppSelect";

import ManagementFormModal from "../../../../shared/components/ManagementFormModal";
import AppInput from "../../../../shared/components/AppInput";

import { ADDRESS_TYPES, ADDRESS_TYPE_OPTIONS } from "../../constants";

import "./AddressFormModal.scss";

const trimmedRequiredRule = (label) => ({
  validator(_, value) {
    if (String(value || "").trim()) {
      return Promise.resolve();
    }

    return Promise.reject(new Error(`Vui lòng nhập ${label}.`));
  },
});

function AddressFormModal({
  open,
  mode,
  address,
  loading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  const isCreate = mode === "create";

  useEffect(() => {
    if (!open) {
      return;
    }

    form.resetFields();

    if (isCreate) {
      form.setFieldsValue({
        addressType: ADDRESS_TYPES.NORMAL,
      });

      return;
    }

    form.setFieldsValue({
      unit: address?.unit || "",

      addressName: address?.addressName || "",
    });
  }, [address, form, isCreate, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await onSubmit({
        unit: String(values.unit || "").trim(),

        addressName: String(values.addressName || "").trim(),

        addressType: isCreate ? values.addressType : undefined,
      });
    } catch (error) {
      /*
       * AntD validation error.
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
       * Business/API error:
       * page chịu trách nhiệm toast.
       */
      throw error;
    }
  };

  return (
    <ManagementFormModal
      open={open}
      width={560}
      title={isCreate ? "Thêm địa chỉ" : "Chỉnh sửa địa chỉ"}
      description={
        isCreate
          ? "Tạo địa chỉ mới thuộc tài khoản quản lý hiện tại."
          : "Cập nhật đơn vị và thông tin địa chỉ."
      }
      loading={loading}
      primaryText={isCreate ? "Thêm địa chỉ" : "Lưu thay đổi"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        validateTrigger={["onBlur", "onChange"]}
        className="address-form"
      >
        <Form.Item
          name="unit"
          label="Đơn vị"
          validateFirst
          rules={[trimmedRequiredRule("đơn vị")]}
        >
          <AppInput
            placeholder="Ví dụ: NORDIC"
            autoComplete="off"
            className="address-form__input"
          />
        </Form.Item>

        <Form.Item
          name="addressName"
          label="Địa chỉ"
          validateFirst
          rules={[trimmedRequiredRule("địa chỉ")]}
        >
          <AppInput.TextArea
            rows={3}
            placeholder="Nhập địa chỉ cụ thể"
            className="address-form__textarea"
          />
        </Form.Item>

        {isCreate ? (
          <Form.Item
            name="addressType"
            label="Loại địa chỉ"
            rules={[
              {
                required: true,

                message: "Vui lòng chọn loại địa chỉ.",
              },
            ]}
          >
            <AppSelect
              size="lg"
              placeholder="Chọn loại địa chỉ"
              options={ADDRESS_TYPE_OPTIONS}
              className="address-form__select"
            />
          </Form.Item>
        ) : null}
      </Form>
    </ManagementFormModal>
  );
}

AddressFormModal.propTypes = {
  open: PropTypes.bool.isRequired,

  mode: PropTypes.oneOf(["create", "edit"]).isRequired,

  address: PropTypes.object,

  loading: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSubmit: PropTypes.func.isRequired,
};

AddressFormModal.defaultProps = {
  address: null,

  loading: false,
};

export default AddressFormModal;
