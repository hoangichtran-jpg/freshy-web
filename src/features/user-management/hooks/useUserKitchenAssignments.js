import { useCallback, useEffect, useState } from "react";

import { getPosInfo } from "../../../shared/api/manager.api";

import {
  addPosForAgency,
  addPosForShipper,
  removePosForAgency,
  removePosForShipper,
} from "../api";

import { USER_MANAGEMENT_TYPES } from "../constants";

const ADD_ACTIONS = {
  [USER_MANAGEMENT_TYPES.AGENCY]: addPosForAgency,

  [USER_MANAGEMENT_TYPES.SHIPPER]: addPosForShipper,
};

const REMOVE_ACTIONS = {
  [USER_MANAGEMENT_TYPES.AGENCY]: removePosForAgency,

  [USER_MANAGEMENT_TYPES.SHIPPER]: removePosForShipper,
};

/* ========================================
   Helpers
======================================== */

const normalizePosIds = (posIds) =>
  Array.from(
    new Set(
      (posIds || [])
        .map(Number)
        .filter((posId) => Number.isInteger(posId) && posId > 0),
    ),
  );

const runAssignmentBatch = async ({ action, phoneNumber, posIds }) => {
  const normalizedIds = normalizePosIds(posIds);

  if (normalizedIds.length === 0) {
    throw new Error("Hãy chọn ít nhất một bếp.");
  }

  const results = await Promise.allSettled(
    normalizedIds.map((posId) => action(phoneNumber, posId)),
  );

  const succeededIds = [];

  const failures = [];

  results.forEach((result, index) => {
    const posId = normalizedIds[index];

    if (result.status === "fulfilled") {
      succeededIds.push(posId);

      return;
    }

    failures.push({
      posId,

      error: result.reason,
    });
  });

  return {
    requestedIds: normalizedIds,

    succeededIds,

    failedIds: failures.map((failure) => failure.posId),

    failures,

    firstError: failures[0]?.error || null,

    isSuccess: failures.length === 0,

    isPartial: succeededIds.length > 0 && failures.length > 0,
  };
};

function useUserKitchenAssignments(type, managerPhone) {
  const [kitchens, setKitchens] = useState([]);

  const [kitchensLoading, setKitchensLoading] = useState(false);

  const [kitchensError, setKitchensError] = useState(null);

  const [mutationAction, setMutationAction] = useState(null);

  const addAction = ADD_ACTIONS[type];

  const removeAction = REMOVE_ACTIONS[type];

  /* ========================================
     Load kitchens
  ======================================== */

  const refreshKitchens = useCallback(async () => {
    if (!managerPhone) {
      setKitchens([]);

      setKitchensError(null);

      setKitchensLoading(false);

      return [];
    }

    setKitchensLoading(true);

    setKitchensError(null);

    try {
      const response = await getPosInfo(managerPhone);

      const nextKitchens = Array.isArray(response) ? response : [];

      setKitchens(nextKitchens);

      return nextKitchens;
    } catch (error) {
      setKitchens([]);

      setKitchensError(error);

      throw error;
    } finally {
      setKitchensLoading(false);
    }
  }, [managerPhone]);

  useEffect(() => {
    refreshKitchens().catch(() => {});
  }, [refreshKitchens]);

  /* ========================================
     Add kitchens
  ======================================== */

  const addKitchens = useCallback(
    async (user, posIds) => {
      const phoneNumber = user?.phoneNumber;

      if (!phoneNumber) {
        throw new Error("Không xác định được người dùng.");
      }

      if (typeof addAction !== "function") {
        throw new Error("Không hỗ trợ phân công bếp cho loại người dùng này.");
      }

      setMutationAction("add");

      try {
        return await runAssignmentBatch({
          action: addAction,

          phoneNumber,

          posIds,
        });
      } finally {
        setMutationAction(null);
      }
    },
    [addAction],
  );

  /* ========================================
     Remove kitchens
  ======================================== */

  const removeKitchens = useCallback(
    async (user, posIds) => {
      const phoneNumber = user?.phoneNumber;

      if (!phoneNumber) {
        throw new Error("Không xác định được người dùng.");
      }

      if (typeof removeAction !== "function") {
        throw new Error(
          "Không hỗ trợ bỏ phân công bếp cho loại người dùng này.",
        );
      }

      setMutationAction("remove");

      try {
        return await runAssignmentBatch({
          action: removeAction,

          phoneNumber,

          posIds,
        });
      } finally {
        setMutationAction(null);
      }
    },
    [removeAction],
  );

  return {
    kitchens,

    kitchensLoading,

    kitchensError,

    mutationAction,

    isMutating: mutationAction !== null,

    refreshKitchens,

    addKitchens,

    removeKitchens,
  };
}

export default useUserKitchenAssignments;
