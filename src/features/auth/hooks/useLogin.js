import { useCallback, useRef, useState } from "react";

import {
  buildUserInfoFromToken,
  persistSession,
} from "../../../shared/auth/session";

import { registerFCMToken } from "../../../utils/fcmRegister";

import { loginManager } from "../api";

/* ========================================
   Constants
======================================== */

const MANAGER_ROLES = ["ROLE_ADMIN", "ROLE_SUPER_ADMIN"];

/* ========================================
   Helpers
======================================== */

const normalizePhoneNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return `+${digits}`;
};

const hasManagerRole = (roles) => {
  if (!Array.isArray(roles)) {
    return false;
  }

  return MANAGER_ROLES.some((role) => roles.includes(role));
};

const createLoginError = (message, code) => {
  const error = new Error(message);

  error.code = code;

  return error;
};

/* ========================================
   Hook
======================================== */

function useLogin() {
  const [loggingIn, setLoggingIn] = useState(false);

  /*
   * Chặn double submit trước khi
   * React kịp update loading state.
   */
  const loggingInRef = useRef(false);

  const login = useCallback(async ({ phoneNumber, password }) => {
    if (loggingInRef.current) {
      return {
        ok: false,
        skipped: true,
        error: null,
      };
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const normalizedPassword = String(password ?? "");

    /* ========================================
           Client validation
        ======================================== */

    if (!normalizedPhone) {
      return {
        ok: false,
        skipped: false,

        error: createLoginError(
          "Vui lòng nhập số điện thoại.",
          "PHONE_REQUIRED",
        ),
      };
    }

    if (!normalizedPassword) {
      return {
        ok: false,
        skipped: false,

        error: createLoginError("Vui lòng nhập mật khẩu.", "PASSWORD_REQUIRED"),
      };
    }

    loggingInRef.current = true;

    setLoggingIn(true);

    try {
      /* ========================================
             Authenticate
          ======================================== */

      const data = await loginManager({
        phoneNumber: normalizedPhone,

        password: normalizedPassword,
      });

      const accessToken = data?.["access-token"];

      const refreshToken = data?.["refresh-token"];

      if (!accessToken) {
        throw createLoginError(
          "Máy chủ không trả về phiên đăng nhập hợp lệ.",
          "INVALID_AUTH_RESPONSE",
        );
      }

      /* ========================================
             Decode claims for frontend use

             IMPORTANT:
             decode != verify

             Backend vẫn là nơi verify JWT.
          ======================================== */

      const userInfo = buildUserInfoFromToken(accessToken);

      if (!userInfo) {
        throw createLoginError(
          "Không thể đọc thông tin phiên đăng nhập.",
          "INVALID_AUTH_RESPONSE",
        );
      }

      /* ========================================
             Frontend access guard

             Đây chỉ là UX guard.
             Backend vẫn phải enforce role.
          ======================================== */

      if (!hasManagerRole(userInfo.userRoles)) {
        throw createLoginError(
          "Tài khoản này không có quyền truy cập hệ thống quản lý.",
          "UNAUTHORIZED_ROLE",
        );
      }

      /* ========================================
             Persist session

             Đây là nơi DUY NHẤT useLogin
             cần biết để tạo session.
          ======================================== */

      persistSession({
        accessToken,
        refreshToken,
      });

      /* ========================================
             Secondary side effect

             FCM failure không được làm
             login thất bại.
          ======================================== */

      registerFCMToken({
        phone: userInfo.userPhone,
      }).catch((error) => {
        console.error("FCM registration failed:", error);
      });

      return {
        ok: true,
        skipped: false,

        data,
        userInfo,

        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        skipped: false,
        error,
      };
    } finally {
      loggingInRef.current = false;

      setLoggingIn(false);
    }
  }, []);

  return {
    loggingIn,
    login,
  };
}

export default useLogin;
