import axios from "axios";

import {
  API_BASE_URL,
} from "./apiConfig";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  persistSession,
  updateAccessToken,
} from "../auth/session";

/* ========================================
   Main API client

   Business requests use this client.
======================================== */

export const request = axios.create({
  baseURL: API_BASE_URL,
});

/* ========================================
   Refresh-only client

   IMPORTANT:

   This client intentionally does NOT use
   the main response interceptor.

   Otherwise:

   refresh
   → 401
   → interceptor
   → refresh
   → 401
   → ...

   could create an infinite loop.
======================================== */

const refreshRequest = axios.create({
  baseURL: API_BASE_URL,
});

/* ========================================
   Shared refresh lock

   null:
   no refresh is currently running.

   Promise:
   one refresh operation is currently
   shared by every waiting request.
======================================== */

let refreshPromise = null;

/* ========================================
   Refresh access token
======================================== */

export const refreshAccessToken = async () => {
  /* ====================================
       Reuse current refresh operation
    ==================================== */

  if (refreshPromise) {
    return refreshPromise;
  }

  /* ====================================
       Current backend contract

       Refresh token is still readable
       by frontend JavaScript.

       This will change when backend moves
       it to an HttpOnly cookie.
    ==================================== */

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearSession();

    throw new Error("Refresh token is unavailable.");
  }

  /* ====================================
       Start ONE refresh request
    ==================================== */

  refreshPromise = refreshRequest
    .post(
      "auth/refresh-token",

      {},

      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )

    /* =================================
           Refresh success
        ================================= */

    .then((response) => {
      const data = response.data;

      const accessToken = data?.["access-token"];

      const nextRefreshToken = data?.["refresh-token"];

      if (!accessToken) {
        throw new Error("Invalid refresh response.");
      }

      /*
       * Backend may rotate
       * refresh tokens.
       */
      if (nextRefreshToken) {
        persistSession({
          accessToken,

          refreshToken: nextRefreshToken,
        });
      } else {
        /*
         * Backend returned only
         * a new access token.
         *
         * Preserve existing
         * refresh token.
         */
        updateAccessToken(accessToken);
      }

      return accessToken;
    })

    /* =================================
           Refresh failure policy

           IMPORTANT:

           401 / 403:
           backend explicitly rejected
           refresh authentication.

           → session is no longer usable
           → clear session

           Network / timeout / 5xx:
           does NOT prove that the user's
           session is invalid.

           → keep session
        ================================= */

    .catch((error) => {
      const status = error?.response?.status;

      const isAuthRejected = status === 401 || status === 403;

      if (isAuthRejected) {
        clearSession();
      }

      throw error;
    })

    /* =================================
           Release refresh lock
        ================================= */

    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/* ========================================
   Request interceptor

   Automatically inject current
   access token into protected requests.
======================================== */

request.interceptors.request.use(
  (config) => {
    /* ====================================
       Public request

       Caller explicitly says:

       "Do not attach access token."
    ==================================== */

    if (config.skipAuth === true) {
      return config;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      return config;
    }

    config.headers = config.headers || {};

    /*
     * Do not overwrite an Authorization
     * header explicitly supplied by
     * the caller.
     */
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => Promise.reject(error),
);

/* ========================================
   Response interceptor

   Normal request:

   API
   → 401
   → refresh
   → new access token
   → retry original API
======================================== */

request.interceptors.response.use(
  /* ======================================
     Success
  ====================================== */

  (response) => response,

  /* ======================================
     Error
  ====================================== */

  async (error) => {
    const originalRequest = error?.config;

    const status = error?.response?.status;

    /* ====================================
       Not an authentication error
    ==================================== */

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    /* ====================================
       Public requests must NOT trigger
       token refresh.

       Example:

       wrong login password
       → 401

       That does NOT mean the current
       access token needs refreshing.
    ==================================== */

    if (originalRequest.skipAuth === true) {
      return Promise.reject(error);
    }

    /* ====================================
       Extra protection for auth endpoints
    ==================================== */

    const requestUrl = String(originalRequest.url || "");

    const isAuthRequest =
      requestUrl.includes("auth/authenticate") ||
      requestUrl.includes("auth/refresh-token");

    if (isAuthRequest) {
      return Promise.reject(error);
    }

    /* ====================================
       Prevent infinite retry

       API
       → 401
       → refresh
       → retry API

       If retried API is still 401:
       → STOP
    ==================================== */

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /* ==================================
         All simultaneous 401 requests
         await the SAME refreshPromise.
      ================================== */

      const accessToken = await refreshAccessToken();

      /* ==================================
         Apply fresh access token
      ================================== */

      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      /* ==================================
         Retry original request
      ================================== */

      return request(originalRequest);
    } catch (refreshError) {
      /*
       * refreshAccessToken() decides
       * whether session should actually
       * be cleared.
       *
       * 401 / 403
       * → cleared
       *
       * network / 5xx
       * → preserved
       */

      return Promise.reject(refreshError);
    }
  },
);
