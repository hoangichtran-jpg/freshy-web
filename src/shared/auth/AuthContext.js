import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import PropTypes from "prop-types";

import { refreshAccessToken } from "../api/httpClient";

import {
  getRefreshToken,
  getSessionSnapshot,
  isAccessTokenExpired,
  subscribeToSession,
} from "./session";

/* ========================================
   Context
======================================== */

const AuthContext = createContext(null);

/* ========================================
   Hook
======================================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

/* ========================================
   Provider
======================================== */

export function AuthProvider({ children }) {
  /* ========================================
     Login modal state
  ======================================== */

  const [openFormLogin, setOpenFormLogin] = useState(false);

  /* ========================================
     Authentication status

     checking
     authenticated
     anonymous
     unavailable

     checking:
     auth resolution is in progress.

     authenticated:
     usable session exists.

     anonymous:
     session is confirmed absent/invalid.

     unavailable:
     session validity could not be
     determined because infrastructure
     is temporarily unavailable.
  ======================================== */

  const [authStatus, setAuthStatus] = useState("checking");

  /* ========================================
     Runtime session state
  ======================================== */

  const [tokenStr, setTokenStr] = useState("");

  const [userAuth, setUserAuth] = useState(null);

  /* ========================================
     Apply anonymous state
  ======================================== */

  const applyAnonymous = useCallback(() => {
    setTokenStr("");

    setUserAuth(null);

    setAuthStatus("anonymous");
  }, []);

  /* ========================================
     Apply authenticated state
  ======================================== */

  const applyAuthenticated = useCallback((accessToken, userInfo) => {
    setTokenStr(accessToken);

    setUserAuth(userInfo);

    setAuthStatus("authenticated");
  }, []);

  /* ========================================
     Persistence → React state

     This also attempts session recovery
     when access token is expired.
  ======================================== */

  const syncSession = useCallback(async () => {
    const session = getSessionSnapshot();

    const accessToken = session.accessToken;

    const userInfo = session.userInfo;

    /* ==================================
           Case 1:
           Existing access token is valid
        ================================== */

    if (accessToken && userInfo && !isAccessTokenExpired(accessToken)) {
      applyAuthenticated(accessToken, userInfo);

      return;
    }

    /* ==================================
           Case 2:
           Access token is missing,
           malformed or expired.

           Before declaring anonymous,
           check whether refresh session
           can recover authentication.
        ================================== */

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      applyAnonymous();

      return;
    }

    /* ==================================
           Case 3:
           Try session recovery

           RequireAuth must not redirect
           while refresh is running.
        ================================== */

    setAuthStatus("checking");

    try {
      /*
       * refreshAccessToken() uses
       * the shared refresh lock.
       */
      await refreshAccessToken();

      /*
       * Refresh already persisted
       * the recovered session.
       *
       * Read it again from the
       * session boundary.
       */
      const refreshedSession = getSessionSnapshot();

      const refreshedAccessToken = refreshedSession.accessToken;

      const refreshedUserInfo = refreshedSession.userInfo;

      /* =================================
             Validate recovered session
          ================================= */

      if (
        !refreshedAccessToken ||
        !refreshedUserInfo ||
        isAccessTokenExpired(refreshedAccessToken)
      ) {
        throw new Error("Unable to restore authenticated session.");
      }

      /* =================================
             Recovery successful
          ================================= */

      applyAuthenticated(refreshedAccessToken, refreshedUserInfo);
    } catch {
      /*
       * Important distinction:
       *
       * refresh 401 / 403
       * → httpClient clears session
       * → refresh token disappears
       * → anonymous
       *
       * network / timeout / 5xx
       * → httpClient preserves session
       * → refresh token still exists
       * → unavailable
       */

      const refreshTokenStillExists = Boolean(getRefreshToken());

      if (refreshTokenStillExists) {
        setAuthStatus("unavailable");

        return;
      }

      applyAnonymous();
    }
  }, [applyAnonymous, applyAuthenticated]);

  /* ========================================
     Bootstrap + subscription
  ======================================== */

  useEffect(() => {
    /*
     * Application startup:
     *
     * valid access token
     * → authenticated
     *
     * expired token + refresh success
     * → authenticated
     *
     * refresh rejected
     * → anonymous
     *
     * temporary infrastructure error
     * → unavailable
     */
    syncSession();

    /*
     * Future session changes:
     *
     * login
     * logout
     * token refresh
     * another browser tab
     */
    const unsubscribe = subscribeToSession(syncSession);

    return unsubscribe;
  }, [syncSession]);

  /* ========================================
     Derived state
  ======================================== */

  const isAuthenticated = authStatus === "authenticated";

  /* ========================================
     Context value
  ======================================== */

  const value = {
    openFormLogin,
    setOpenFormLogin,

    authStatus,
    isAuthenticated,

    tokenStr,
    userAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
