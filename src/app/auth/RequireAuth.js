import { useEffect } from "react";

import PropTypes from "prop-types";

import { Navigate } from "react-router-dom";

import config from "../../config";

import { useAuth } from "../../shared/auth";

/* ========================================
   Private-route guard
======================================== */

function RequireAuth({ children }) {
  const {
    authStatus,

    setOpenFormLogin,
  } = useAuth();

  /* ========================================
     Anonymous side effect

     Only confirmed anonymous users
     should receive the login modal.

     unavailable must NOT open login.
  ======================================== */

  useEffect(() => {
    if (authStatus !== "anonymous") {
      return;
    }

    setOpenFormLogin(true);
  }, [authStatus, setOpenFormLogin]);

  /* ========================================
     Checking

     Authentication work is currently
     running.
  ======================================== */

  if (authStatus === "checking") {
    return <div>Đang kiểm tra phiên đăng nhập...</div>;
  }

  /* ========================================
     Temporarily unavailable

     Do NOT redirect.

     We have not proven that the user's
     session is invalid.
  ======================================== */

  if (authStatus === "unavailable") {
    return (
      <div>
        Không thể kiểm tra phiên đăng nhập. Vui lòng kiểm tra kết nối và thử
        lại.
      </div>
    );
  }

  /* ========================================
     Confirmed anonymous
  ======================================== */

  if (authStatus === "anonymous") {
    return <Navigate to={config.routes.home} replace />;
  }

  /* ========================================
     Authenticated
  ======================================== */

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RequireAuth;
