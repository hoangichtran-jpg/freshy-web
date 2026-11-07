import React, {
  useEffect,
} from "react";

import PropTypes from "prop-types";

import { Form } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import AppInput from "../../../../shared/components/AppInput";

import "./PosFormModal.scss";


const normalizePhone = (
  phone,
) => {
  if (!phone) {
    return "";
  }

  if (
    phone.startsWith(
      "0",
    )
  ) {
    return `+84${phone.slice(
      1,
    )}`;
  }

  return phone;
};


function PosFormModal({
  open,
  mode,
  pos,
  defaultPhone,
  submitting,
  onSubmit,
  onClose,
}) {
  const [
    form,
  ] = Form.useForm();


  const isEdit =
    mode === "edit";


  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      phone: isEdit
        ? normalizePhone(
            pos?.phone,
          )
        : normalizePhone(
            defaultPhone,
          ),

      name: isEdit
        ? pos?.posName ||
          ""
        : "",

      address: isEdit
        ? pos?.posAddress ||
          ""
        : "",
    });
  }, [
    defaultPhone,
    form,
    isEdit,
    open,
    pos,
  ]);


  const handleClose =
    () => {
      if (submitting) {
        return;
      }

      form.resetFields();

      onClose();
    };


  const handleFinish =
    async (
      values,
    ) => {
      const payload = {
        name:
          values.name.trim(),

        address:
          values.address.trim(),

        phone:
          values.phone.trim(),
      };


      if (isEdit) {
        const original = {
          name:
            pos?.posName ||
            "",

          address:
            pos?.posAddress ||
            "",

          phone:
            normalizePhone(
              pos?.phone,
            ),
        };


        const hasChanged =
          payload.name !==
            original.name ||
          payload.address !==
            original.address ||
          payload.phone !==
            original.phone;


        if (
          !hasChanged
        ) {
          form.setFields([
            {
              name:
                "name",

              errors: [
                "Không có thay đổi nào để lưu.",
              ],
            },
          ]);

          return;
        }
      }


      await onSubmit(
        payload,
      );
  };


  return (
    <AppModal
      centered={false}
      open={
        open
      }
      title={
        isEdit
          ? "Sửa thông tin trung tâm"
          : "Thêm trung tâm"
      }
      okText={
        isEdit
          ? "Lưu thay đổi"
          : "Thêm trung tâm"
      }
      cancelText="Hủy"
      confirmLoading={
        submitting
      }
      cancelButtonProps={{
        disabled:
          submitting,
      }}
      closable={
        !submitting
      }
      maskClosable={
        !submitting
      }
      keyboard={
        !submitting
      }
      width={
        520
      }
      className="pos-form-modal"
      onOk={() =>
        form.submit()
      }
      onCancel={
        handleClose
      }
    >
      <Form
        form={
          form
        }
        layout="vertical"
        requiredMark={
          false
        }
        className="pos-form-modal__form"
        onFinish={
          handleFinish
        }
      >
        <Form.Item
          label="Tên trung tâm"
          name="name"
          rules={[
            {
              required:
                true,

              whitespace:
                true,

              message:
                "Vui lòng nhập tên trung tâm.",
            },
          ]}
        >
          <AppInput
            placeholder="Nhập tên trung tâm"
            maxLength={
              120
            }
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            {
              required:
                true,

              whitespace:
                true,

              message:
                "Vui lòng nhập số điện thoại.",
            },

            {
              pattern:
                /^\+?[0-9]{8,15}$/,

              message:
                "Số điện thoại không hợp lệ.",
            },
          ]}
        >
          <AppInput
            placeholder="+84901234567"
            inputMode="tel"
            maxLength={
              16
            }
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            {
              required:
                true,

              whitespace:
                true,

              message:
                "Vui lòng nhập địa chỉ trung tâm.",
            },
          ]}
        >
          <AppInput.TextArea
            placeholder="Nhập địa chỉ trung tâm"
            autoSize={{
              minRows:
                3,

              maxRows:
                5,
            }}
            maxLength={
              255
            }
            showCount
          />
        </Form.Item>
      </Form>
    </AppModal>
  );
}


PosFormModal.propTypes = {
  open:
    PropTypes.bool,

  mode:
    PropTypes.oneOf([
      "create",
      "edit",
    ]),

  pos:
    PropTypes.shape({
      posId:
        PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
        ]),

      posName:
        PropTypes.string,

      posAddress:
        PropTypes.string,

      phone:
        PropTypes.string,
    }),

  defaultPhone:
    PropTypes.string,

  submitting:
    PropTypes.bool,

  onSubmit:
    PropTypes.func.isRequired,

  onClose:
    PropTypes.func.isRequired,
};


PosFormModal.defaultProps = {
  open: false,
  mode: "create",
  pos: null,
  defaultPhone: "",
  submitting: false,
};


export default PosFormModal;