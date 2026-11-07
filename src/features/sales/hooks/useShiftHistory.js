import { useEffect, useState } from "react";

import { getShiftHistory, getShiftHistoryDetail } from "../api";
import {
  normalizeShiftHistoryDetail,
  normalizeShiftHistoryPage,
} from "../utils/shiftHistory";

/**
 * Read-only query hook. Page numbers are 0-based to match the backend.
 * The owning panel is keyed by posId, so pagination resets on POS change.
 */
export const useShiftHistory = (posId) => {
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    if (posId == null || posId === "") {
      setRows([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return undefined;
    }

    setRows([]);
    setLoading(true);
    setError(null);

    getShiftHistory({ posId, page, size: 20 })
      .then((response) => {
        const result = normalizeShiftHistoryPage(response);
        if (!active) return;
        setRows(result.rows);
        setTotal(result.total);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [posId, page, refreshKey]);

  useEffect(() => {
    let active = true;

    if (selectedShiftId == null) {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      return undefined;
    }

    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    getShiftHistoryDetail(selectedShiftId)
      .then((response) => {
        const normalized = normalizeShiftHistoryDetail(response);
        if (active) setDetail(normalized);
      })
      .catch((err) => {
        if (active) setDetailError(err);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedShiftId, detailRefreshKey]);

  return {
    page,
    setPage,
    rows,
    total,
    loading,
    error,
    refresh: () => setRefreshKey((key) => key + 1),
    selectedShiftId,
    selectShift: setSelectedShiftId,
    closeDetail: () => setSelectedShiftId(null),
    detail,
    detailLoading,
    detailError,
    retryDetail: () => setDetailRefreshKey((key) => key + 1),
  };
};
