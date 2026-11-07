import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatPhoneNumberWithRegion } from "../../../helpers";

import { getAgenciesByPhone, getShippersByPhone } from "../api";

import {
  USER_MANAGEMENT_TYPES,
  getUserManagementTypeConfig,
} from "../constants";

const FETCHERS = {
  [USER_MANAGEMENT_TYPES.AGENCY]: getAgenciesByPhone,

  [USER_MANAGEMENT_TYPES.SHIPPER]: getShippersByPhone,
};

/* ========================================
   Search helpers
======================================== */

const normalizeSearchValue = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

const getFormattedPhone = (phoneNumber) => {
  if (!phoneNumber) {
    return "";
  }

  try {
    return formatPhoneNumberWithRegion(phoneNumber) || "";
  } catch {
    return String(phoneNumber);
  }
};

const matchesSearch = (user, normalizedSearch) => {
  if (!normalizedSearch) {
    return true;
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const phoneNumber = String(user?.phoneNumber || "");

  const formattedPhone = getFormattedPhone(user?.phoneNumber);

  const searchableText = [fullName, phoneNumber, formattedPhone]
    .join(" ")
    .toLocaleLowerCase("vi");

  return searchableText.includes(normalizedSearch);
};

/* ========================================
   Hook
======================================== */

function useManagedUsers(type, managerPhone) {
  const config = getUserManagementTypeConfig(type);

  const fetchUsers = FETCHERS[type];

  const [users, setUsers] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /*
   * Giúp response cũ không overwrite
   * response mới khi manager/type đổi
   * trong lúc request vẫn đang chạy.
   */
  const requestSequence = useRef(0);

  /* ========================================
     Fetch
  ======================================== */

  const refreshUsers = useCallback(async () => {
    const requestId = requestSequence.current + 1;

    requestSequence.current = requestId;

    if (!managerPhone) {
      setUsers([]);

      setError(null);

      setLoading(false);

      return [];
    }

    if (typeof fetchUsers !== "function") {
      const invalidTypeError = new Error("Loại người dùng không hợp lệ.");

      setUsers([]);

      setError(invalidTypeError);

      throw invalidTypeError;
    }

    setLoading(true);

    setError(null);

    try {
      const response = await fetchUsers(managerPhone);

      const nextUsers = Array.isArray(response) ? response : [];

      /*
       * Nếu request mới hơn đã chạy,
       * bỏ response cũ.
       */
      if (requestSequence.current !== requestId) {
        return nextUsers;
      }

      setUsers(nextUsers);

      return nextUsers;
    } catch (requestError) {
      if (requestSequence.current === requestId) {
        setUsers([]);

        setError(requestError);
      }

      throw requestError;
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [fetchUsers, managerPhone]);

  /* ========================================
     Initial load
  ======================================== */

  useEffect(() => {
    refreshUsers().catch(() => {});

    return () => {
      /*
       * Invalidate request đang chạy
       * khi component unmount/type đổi.
       */
      requestSequence.current += 1;
    };
  }, [refreshUsers]);

  /* ========================================
     Search
  ======================================== */

  const normalizedSearch = useMemo(
    () => normalizeSearchValue(searchValue),
    [searchValue],
  );

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesSearch(user, normalizedSearch)),
    [users, normalizedSearch],
  );

  /* ========================================
     Local mutation helpers
  ======================================== */

  const removeUserByPhone = useCallback((phoneNumber) => {
    setUsers((previous) =>
      previous.filter((user) => user?.phoneNumber !== phoneNumber),
    );
  }, []);

  const replaceUser = useCallback((updatedUser) => {
    const phoneNumber = updatedUser?.phoneNumber;

    if (!phoneNumber) {
      return;
    }

    setUsers((previous) =>
      previous.map((user) =>
        user?.phoneNumber === phoneNumber ? updatedUser : user,
      ),
    );
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  return {
    config,

    users,

    filteredUsers,

    total: users.length,

    filteredTotal: filteredUsers.length,

    searchValue,

    loading,

    error,

    hasSearch: Boolean(normalizedSearch),

    setSearchValue,

    clearSearch,

    refreshUsers,

    removeUserByPhone,

    replaceUser,
  };
}

export default useManagedUsers;
