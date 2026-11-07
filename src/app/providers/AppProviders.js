import PropTypes from "prop-types";

import { AuthProvider } from "../../shared/auth/AuthContext";

function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
