import { useEffect, useMemo, useState } from "react";

import { getPosInfo } from "../api/manager.api";

export const useKitchens = (phoneNumber) => {
  const [kitchens, setKitchens] = useState([]);

  const [selectedKitchenId, setSelectedKitchenId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /* ========================================
     Load kitchens
  ======================================== */

  useEffect(() => {
    let isActive = true;

    const reset = () => {
      setKitchens([]);

      setSelectedKitchenId(null);

      setError(null);

      setLoading(false);
    };

    if (!phoneNumber) {
      reset();

      return undefined;
    }

    const fetchKitchens = async () => {
      setLoading(true);

      setError(null);

      /*
       * Khi manager/user thay đổi,
       * không giữ selection cũ.
       */
      setKitchens([]);

      setSelectedKitchenId(null);

      try {
        const data = await getPosInfo(phoneNumber);

        if (!isActive) {
          return;
        }

        const kitchenOptions = Array.isArray(data)
          ? data
              .filter((kitchen) => kitchen?.posId != null)
              .map((kitchen) => ({
                value: kitchen.posId,

                label: kitchen.posName,
              }))
          : [];

        setKitchens(kitchenOptions);

        setSelectedKitchenId(kitchenOptions[0]?.value ?? null);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setKitchens([]);

        setSelectedKitchenId(null);

        setError(err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchKitchens();

    return () => {
      isActive = false;
    };
  }, [phoneNumber]);

  /* ========================================
     Derived values
  ======================================== */

  const selectedKitchen = useMemo(() => {
    if (selectedKitchenId == null) {
      return null;
    }

    return (
      kitchens.find((kitchen) => kitchen.value === selectedKitchenId) ?? null
    );
  }, [kitchens, selectedKitchenId]);

  const posIds = useMemo(
    () => kitchens.map((kitchen) => kitchen.value),
    [kitchens],
  );

  const posName = selectedKitchen?.label ?? "";

  /* ========================================
     Selection
  ======================================== */

  const handleKitchenSelect = (value) => {
    const exists = kitchens.some((kitchen) => kitchen.value === value);

    if (!exists) {
      return;
    }

    setSelectedKitchenId(value);
  };

  return {
    kitchens,

    selectedKitchenId,

    selectedKitchen,

    posIds,

    posName,

    loading,

    error,

    handleKitchenSelect,
  };
};
