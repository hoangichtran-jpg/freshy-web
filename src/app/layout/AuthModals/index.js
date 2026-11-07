import PropTypes from "prop-types";

import { LoginModal } from "../../../features/auth";

function AuthModals({ openFormLogin, onCloseLogin }) {
  return <LoginModal open={openFormLogin} onClose={onCloseLogin} />;
}

AuthModals.propTypes = {
  openFormLogin: PropTypes.bool,
  onCloseLogin: PropTypes.func.isRequired,
};

AuthModals.defaultProps = {
  openFormLogin: false,
};

export default AuthModals;
