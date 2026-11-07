import { useCallback } from "react";

import { clearSession } from "../../../shared/auth/session";

function useLogout() {
  const logout = useCallback(() => {
    clearSession();

    return {
      ok: true,
    };
  }, []);

  return {
    logout,
  };
}

export default useLogout;
