import { useCallback, useEffect, useRef, useState } from "react";

import { getManagedPosList } from "../api";

export default function usePosList(managerPhone) {
  const [posList, setPosList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  const fetchPosList = useCallback(async () => {
    if (!managerPhone) {
      setPosList([]);
      setError(null);

      return [];
    }

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const data = await getManagedPosList(managerPhone);

      if (requestId !== requestIdRef.current) {
        return [];
      }

      const nextList = Array.isArray(data) ? data : [];

      setPosList(nextList);

      return nextList;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return [];
      }

      setPosList([]);
      setError(err);

      throw err;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [managerPhone]);

  useEffect(() => {
    fetchPosList().catch(() => {});

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchPosList]);

  const refresh = useCallback(() => fetchPosList(), [fetchPosList]);

  return {
    posList,
    loading,
    error,
    refresh,
  };
}
