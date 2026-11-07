import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAgenciesByPhone } from "../../../shared/api/manager.api";

const getAgencyName = (agency) =>
  [agency?.firstName, agency?.lastName].filter(Boolean).join(" ").trim();

function useAddressAgencies(managerPhone) {
  const [agencies, setAgencies] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const requestSequence = useRef(0);

  /* ========================================
     Load agencies
  ======================================== */

  const refreshAgencies = useCallback(async () => {
    const requestId = requestSequence.current + 1;

    requestSequence.current = requestId;

    if (!managerPhone) {
      setAgencies([]);

      setError(null);

      setLoading(false);

      return [];
    }

    setLoading(true);

    setError(null);

    try {
      const response = await getAgenciesByPhone(managerPhone);

      const nextAgencies = Array.isArray(response) ? response : [];

      if (requestSequence.current !== requestId) {
        return nextAgencies;
      }

      setAgencies(nextAgencies);

      return nextAgencies;
    } catch (requestError) {
      if (requestSequence.current === requestId) {
        setAgencies([]);

        setError(requestError);
      }

      throw requestError;
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [managerPhone]);

  useEffect(() => {
    refreshAgencies().catch(() => {});

    return () => {
      requestSequence.current += 1;
    };
  }, [refreshAgencies]);

  /* ========================================
     Derived data
  ======================================== */

  const agencyOptions = useMemo(
    () =>
      agencies
        .filter((agency) => agency?.agencyId != null)
        .map((agency) => ({
          value: agency.agencyId,

          label: getAgencyName(agency) || agency.phoneNumber || "Đại lý",

          agency,
        })),
    [agencies],
  );

  const agencyById = useMemo(
    () =>
      new Map(
        agencies
          .filter((agency) => agency?.agencyId != null)
          .map((agency) => [agency.agencyId, agency]),
      ),
    [agencies],
  );

  const getAgencyById = useCallback(
    (agencyId) => agencyById.get(agencyId) || null,
    [agencyById],
  );

  return {
    agencies,

    agencyOptions,

    loading,

    error,

    refreshAgencies,

    getAgencyById,
  };
}

export default useAddressAgencies;
