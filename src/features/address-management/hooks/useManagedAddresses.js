import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAllAddressByManagerPhone } from "../api";

/* ========================================
   Helpers
======================================== */

const normalizeSearchValue = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

const getAgencyName = (agency) =>
  [agency?.firstName, agency?.lastName].filter(Boolean).join(" ").trim();

/* ========================================
   Hook
======================================== */

function useManagedAddresses(managerPhone, agencies = []) {
  const [addresses, setAddresses] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /*
   * Tránh response cũ overwrite
   * response mới nếu manager đổi
   * trong lúc request đang chạy.
   */
  const requestSequence = useRef(0);

  /* ========================================
     Fetch
  ======================================== */

  const refreshAddresses = useCallback(async () => {
    const requestId = requestSequence.current + 1;

    requestSequence.current = requestId;

    if (!managerPhone) {
      setAddresses([]);

      setError(null);

      setLoading(false);

      return [];
    }

    setLoading(true);

    setError(null);

    try {
      const response = await getAllAddressByManagerPhone(managerPhone);

      const nextAddresses = Array.isArray(response) ? response : [];

      if (requestSequence.current !== requestId) {
        return nextAddresses;
      }

      setAddresses(nextAddresses);

      return nextAddresses;
    } catch (requestError) {
      if (requestSequence.current === requestId) {
        setAddresses([]);

        setError(requestError);
      }

      throw requestError;
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [managerPhone]);

  /* ========================================
     Initial load
  ======================================== */

  useEffect(() => {
    refreshAddresses().catch(() => {});

    return () => {
      requestSequence.current += 1;
    };
  }, [refreshAddresses]);

  /*
   * Manager thay đổi thì
   * không giữ search cũ.
   */
  useEffect(() => {
    setSearchValue("");
  }, [managerPhone]);

  /* ========================================
     Agency lookup
  ======================================== */

  const agencyNameById = useMemo(() => {
    const lookup = new Map();

    agencies.forEach((agency) => {
      if (agency?.agencyId == null) {
        return;
      }

      lookup.set(agency.agencyId, getAgencyName(agency));
    });

    return lookup;
  }, [agencies]);

  /* ========================================
     Search
  ======================================== */

  const normalizedSearch = useMemo(
    () => normalizeSearchValue(searchValue),
    [searchValue],
  );

  const filteredAddresses = useMemo(() => {
    if (!normalizedSearch) {
      return addresses;
    }

    return addresses.filter((address) => {
      const addressName = String(address?.addressName || "").toLocaleLowerCase(
        "vi",
      );

      const unit = String(address?.unit || "").toLocaleLowerCase("vi");

      const agencyName = String(
        agencyNameById.get(address?.agencyId) || "",
      ).toLocaleLowerCase("vi");

      return (
        addressName.includes(normalizedSearch) ||
        unit.includes(normalizedSearch) ||
        agencyName.includes(normalizedSearch)
      );
    });
  }, [addresses, agencyNameById, normalizedSearch]);

  /* ========================================
     Local state helpers
  ======================================== */

  const removeAddressById = useCallback((addressId) => {
    setAddresses((previous) =>
      previous.filter((address) => address?.addressId !== addressId),
    );
  }, []);

  const replaceAddress = useCallback((updatedAddress) => {
    const addressId = updatedAddress?.addressId;

    if (addressId == null) {
      return;
    }

    setAddresses((previous) =>
      previous.map((address) =>
        address?.addressId === addressId ? updatedAddress : address,
      ),
    );
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  return {
    addresses,

    filteredAddresses,

    total: addresses.length,

    filteredTotal: filteredAddresses.length,

    searchValue,

    hasSearch: Boolean(normalizedSearch),

    loading,

    error,

    setSearchValue,

    clearSearch,

    refreshAddresses,

    removeAddressById,

    replaceAddress,
  };
}

export default useManagedAddresses;
