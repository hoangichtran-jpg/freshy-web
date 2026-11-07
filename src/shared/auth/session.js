import Cookies from "js-cookie";

/* ========================================
   Storage keys
======================================== */

const ACCESS_TOKEN_KEY = "jwtToken";

const USER_INFO_KEY = "userInfo";

const REFRESH_TOKEN_KEY = "refreshToken";

const SESSION_EVENT = "freshy:session-changed";

/* ========================================
   Access token
======================================== */

export const getAccessToken = () => {
  const raw = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!raw) {
    return "";
  }

  /*
   * Freshy legacy format:
   *
   * localStorage.setItem(
   *   "jwtToken",
   *   JSON.stringify(token)
   * )
   *
   * Keep backward compatibility
   * during migration.
   */
  try {
    const parsed = JSON.parse(raw);

    return typeof parsed === "string" ? parsed : "";
  } catch {
    /*
     * Also tolerate plain-string
     * token storage.
     */
    return raw;
  }
};

/* ========================================
   User info
======================================== */

export const getStoredUserInfo = () => {
  const raw = localStorage.getItem(USER_INFO_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/* ========================================
   Refresh token

   Transitional architecture.

   Backend currently exposes refresh token
   to JavaScript.

   After backend migrates to HttpOnly cookie,
   frontend must no longer read this token.
======================================== */

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY) || "";
};

/* ========================================
   Persist primitive values
======================================== */

export const saveAccessToken = (token) => {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,

    JSON.stringify(token),
  );
};

export const saveUserInfo = (userInfo) => {
  localStorage.setItem(
    USER_INFO_KEY,

    JSON.stringify(userInfo),
  );
};

/* ========================================
   JWT decode

   IMPORTANT:

   This only decodes JWT claims.

   It does NOT verify the JWT signature.

   Backend remains responsible for:
   - signature verification
   - expiration validation
   - authorization
======================================== */

export const decodeJwt = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64Url = parts[1];

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const binary = window.atob(padded);

    const bytes = Uint8Array.from(
      binary,

      (character) => character.charCodeAt(0),
    );

    const json = new TextDecoder("utf-8").decode(bytes);

    return JSON.parse(json);
  } catch {
    return null;
  }
};

/* ========================================
   Build frontend user information

   JWT claims are used for UI/session state.

   They are NOT a replacement for backend
   authorization.
======================================== */

export const buildUserInfoFromToken = (accessToken) => {
  const payload = decodeJwt(accessToken);

  if (!payload) {
    return null;
  }

  const roles = Array.isArray(payload.authorities)
    ? payload.authorities.map((role) => String(role))
    : [];

  return {
    userName: payload.fullName || "",

    userPhone: payload.sub || "",

    userRoles: roles,

    expiresTime: payload.exp
      ? new Date(payload.exp * 1000).toISOString()
      : null,
  };
};

/* ========================================
   Access-token expiration

   This is only a frontend convenience
   check.

   It does NOT verify token authenticity.
======================================== */

export const isAccessTokenExpired = (
  accessToken,

  { skewMs = 30_000 } = {},
) => {
  const payload = decodeJwt(accessToken);

  const exp = Number(payload?.exp);

  if (!Number.isFinite(exp)) {
    return true;
  }

  return exp * 1000 <= Date.now() + skewMs;
};

/* ========================================
   Session event

   Used for same-tab session changes.
======================================== */

const emitSessionChange = () => {
  window.dispatchEvent(new Event(SESSION_EVENT));
};

/* ========================================
   Persist complete session
======================================== */

export const persistSession = ({ accessToken, refreshToken }) => {
  if (!accessToken) {
    throw new Error("Access token is required.");
  }

  const userInfo = buildUserInfoFromToken(accessToken);

  if (!userInfo) {
    throw new Error("Invalid access token.");
  }

  saveAccessToken(accessToken);

  saveUserInfo(userInfo);

  /*
   * Transitional architecture.
   *
   * Backend currently returns refresh
   * token to JavaScript.
   *
   * Delete this when backend uses
   * HttpOnly refresh cookie.
   */
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7,

      secure: true,

      sameSite: "Strict",

      path: "/",
    });
  }

  emitSessionChange();

  return userInfo;
};

/* ========================================
   Update access token

   Used after successful refresh.

   Existing refresh token is preserved.
======================================== */

export const updateAccessToken = (accessToken) => {
  return persistSession({
    accessToken,
  });
};

/* ========================================
   Clear session
======================================== */

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);

  localStorage.removeItem(USER_INFO_KEY);

  /*
   * Transitional only.
   *
   * Backend HttpOnly-cookie migration
   * will remove JS ownership of this.
   */
  Cookies.remove(REFRESH_TOKEN_KEY, {
    path: "/",
  });

  emitSessionChange();
};

/* ========================================
   Session snapshot
======================================== */

export const getSessionSnapshot = () => ({
  accessToken: getAccessToken(),

  userInfo: getStoredUserInfo(),
});

/* ========================================
   Subscribe session changes

   Custom event:
   → current browser tab

   Storage event:
   → other browser tabs
======================================== */

export const subscribeToSession = (listener) => {
  const handleSessionChange = () => {
    listener();
  };

  const handleStorage = (event) => {
    if (event.key !== ACCESS_TOKEN_KEY && event.key !== USER_INFO_KEY) {
      return;
    }

    listener();
  };

  window.addEventListener(SESSION_EVENT, handleSessionChange);

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(SESSION_EVENT, handleSessionChange);

    window.removeEventListener("storage", handleStorage);
  };
};
