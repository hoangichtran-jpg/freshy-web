import { useCallback, useState } from "react";

import { createManagedUser, updateManagedUser } from "../api";

import { getUserManagementTypeConfig } from "../constants";

function useManagedUserEditor(type) {
  const config = getUserManagementTypeConfig(type);

  const [savingMode, setSavingMode] = useState(null);

  const createUser = useCallback(
    async (values, managerPhone) => {
      if (!config?.role) {
        throw new Error("Loại người dùng không hợp lệ.");
      }

      if (!managerPhone) {
        throw new Error("Không xác định được tài khoản quản lý.");
      }

      setSavingMode("create");

      const payload = {
        firstName: values.firstName,

        lastName: values.lastName,

        phoneNumber: values.phoneNumber,

        password: values.password,

        role: config.role,

        managerPhone,
      };

      try {
        return await createManagedUser(payload);
      } finally {
        setSavingMode(null);
      }
    },
    [config],
  );

  const updateUser = useCallback(async (user, values) => {
    const phoneNumber = user?.phoneNumber;

    if (!phoneNumber) {
      throw new Error("Không xác định được số điện thoại người dùng.");
    }

    setSavingMode("edit");

    const payload = {
      firstName: values.firstName,

      lastName: values.lastName,

      birthday: values.birthday || null,

      addressDetail: values.addressDetail || "",
    };

    try {
      return await updateManagedUser(phoneNumber, payload);
    } finally {
      setSavingMode(null);
    }
  }, []);

  return {
    savingMode,

    isSaving: savingMode !== null,

    createUser,

    updateUser,
  };
}

export default useManagedUserEditor;
