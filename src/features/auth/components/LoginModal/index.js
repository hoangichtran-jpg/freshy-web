import { useEffect, useState } from "react";

import PropTypes from "prop-types";

import { Button, Input, Select } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import { LockOutlined } from "@ant-design/icons";

import toast from "../../../../shared/components/AppToast";

import { useLogin } from "../../hooks";

import "./LoginModal.scss";

const COUNTRY_OPTIONS = [
  {
    value: "84",

    label: (
      <span className="freshy-login__country-option">
        <span className="freshy-login__country-flag">🇻🇳</span>

        <span>+84</span>
      </span>
    ),
  },
];

const normalizeLocalPhone = (value) => {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
};

function LoginModal({ open, onClose }) {

  const { loggingIn, login } = useLogin();

  /* ========================================
     Form state
  ======================================== */

  const [countryCode, setCountryCode] = useState("84");

  const [localPhone, setLocalPhone] = useState("");

  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    phoneNumber: "",
    password: "",
  });

  /* ========================================
     Reset

     Login credentials không được giữ lại
     sau khi modal đóng.
  ======================================== */

  useEffect(() => {
    if (open) {
      return;
    }

    setCountryCode("84");

    setLocalPhone("");

    setPassword("");

    setErrors({
      phoneNumber: "",
      password: "",
    });
  }, [open]);

  /* ========================================
     Validation

     Login chỉ validate presence.

     Không enforce password policy ở đây:
     account cũ có thể dùng policy khác.
  ======================================== */

  const validate = () => {
    const nextErrors = {
      phoneNumber: "",
      password: "",
    };

    if (!localPhone.trim()) {
      nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setErrors(nextErrors);

    return !nextErrors.phoneNumber && !nextErrors.password;
  };

  /* ========================================
     Change
  ======================================== */

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    setLocalPhone(value);

    if (errors.phoneNumber) {
      setErrors((previous) => ({
        ...previous,
        phoneNumber: "",
      }));
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (errors.password) {
      setErrors((previous) => ({
        ...previous,
        password: "",
      }));
    }
  };

  /* ========================================
     Submit
  ======================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const normalizedPhone = normalizeLocalPhone(localPhone);

    const phoneNumber = `${countryCode}${normalizedPhone}`;

    const result = await login({
      phoneNumber,
      password,
    });

    if (result?.skipped) {
      return;
    }

    if (!result?.ok) {
      if (result?.error?.code === "UNAUTHORIZED_ROLE") {
        toast.error({
          title: "Không có quyền truy cập",

          description: result.error.message,
        });

        return;
      }

      toast.error({
        title: "Đăng nhập không thành công",

        description: "Số điện thoại hoặc mật khẩu không chính xác.",
      });

      return;
    }

    onClose();

    toast.success({
      title: "Đăng nhập thành công",

      description: "Chào mừng bạn quay lại Freshy.",
    });
  };

  /* ========================================
     Close
  ======================================== */

  const handleClose = () => {
    if (loggingIn) {
      return;
    }

    onClose();
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <AppModal
      open={open}
      width={448}
      footer={null}
      title={null}
      maskClosable={!loggingIn}
      keyboard={!loggingIn}
      closable={!loggingIn}
      className="freshy-login-modal"
      onCancel={handleClose}
    >
      <div className="freshy-login">
        <header className="freshy-login__header">
          <span className="freshy-login__eyebrow">Freshy Manager</span>

          <h1>Đăng nhập vào Freshy</h1>

          <p>Tiếp tục vào không gian quản lý và vận hành.</p>
        </header>

        <form
          className="freshy-login__form"
          onSubmit={handleSubmit}
          aria-busy={loggingIn}
          noValidate
        >
          {/* Phone */}

          <div className="freshy-login__field">
            <label htmlFor="freshy-login-phone">Số điện thoại</label>

            <div
              className={[
                "freshy-login__phone-group",

                errors.phoneNumber ? "freshy-login__phone-group--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Select
                value={countryCode}
                options={COUNTRY_OPTIONS}
                disabled={loggingIn}
                className="freshy-login__country-select"
                popupClassName="freshy-login__country-popup"
                aria-label="Mã quốc gia"
                onChange={setCountryCode}
              />

              <Input
                id="freshy-login-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                bordered={false}
                value={localPhone}
                disabled={loggingIn}
                placeholder="Nhập số điện thoại"
                maxLength={11}
                className="freshy-login__phone-input"
                aria-invalid={Boolean(errors.phoneNumber)}
                aria-describedby="freshy-login-phone-error"
                onChange={handlePhoneChange}
              />
            </div>

            <div
              id="freshy-login-phone-error"
              className="freshy-login__error"
              aria-live="polite"
            >
              {errors.phoneNumber}
            </div>
          </div>

          {/* Password */}

          <div className="freshy-login__field">
            <label htmlFor="freshy-login-password">Mật khẩu</label>

            <Input.Password
              id="freshy-login-password"
              name="password"
              autoComplete="current-password"
              prefix={<LockOutlined />}
              value={password}
              disabled={loggingIn}
              status={errors.password ? "error" : undefined}
              placeholder="Nhập mật khẩu"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="freshy-login-password-error"
              onChange={handlePasswordChange}
            />

            <div
              id="freshy-login-password-error"
              className="freshy-login__error"
              aria-live="polite"
            >
              {errors.password}
            </div>
          </div>

          {/* Submit */}

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loggingIn}
            className="freshy-login__submit"
          >
            Đăng nhập
          </Button>

          <p className="freshy-login__security-note">
            Chỉ dành cho tài khoản quản trị Freshy.
          </p>
        </form>
      </div>
    </AppModal>
  );
}

LoginModal.propTypes = {
  open: PropTypes.bool,

  onClose: PropTypes.func.isRequired,
};

LoginModal.defaultProps = {
  open: false,
};

export default LoginModal;
