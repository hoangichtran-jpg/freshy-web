import { useCallback, useEffect, useRef, useState } from "react";
import {
  getShiftOrdering,
  updateShiftOrdering,
  getShiftClosePreflight,
} from "../api";

/**
 * State for the ShiftActionModal only. Fetching is tied to the modal's
 * lifecycle so an old POS response cannot overwrite a newly selected POS.
 */
export default function useShiftOperatingControls({ posId, open, enabled }) {
  const sequence = useRef(0);
  const mutationLock = useRef(false);
  const [snapshot, setSnapshot] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [changing, setChanging] = useState(false);
  const [preflight, setPreflight] = useState(null);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [preflightError, setPreflightError] = useState(null);

  const refreshStatus = useCallback(async () => {
    if (!posId || !enabled) return null;
    const ticket = ++sequence.current;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const result = await getShiftOrdering(posId);
      if (ticket === sequence.current) setSnapshot(result);
      return result;
    } catch (error) {
      if (ticket === sequence.current) {
        setSnapshot(null);
        setStatusError(error);
      }
      throw error;
    } finally {
      if (ticket === sequence.current) setStatusLoading(false);
    }
  }, [posId, enabled]);

  useEffect(() => {
    ++sequence.current;
    const sequenceValue = sequence.current;
    setSnapshot(null);
    setPreflight(null);
    setStatusError(null);
    setPreflightError(null);
    setStatusLoading(false);
    if (open && posId && enabled) refreshStatus().catch(() => { });
    return () => { console.log("Cleanup cho sequence:", sequenceValue); };
  }, [open, posId, enabled, refreshStatus]);

  const changeAcceptance = useCallback(async (target) => {
    if (mutationLock.current) return null;
    if (!snapshot?.shiftId || snapshot.shiftStatus !== "OPENED") {
      throw new Error("Không có ca đang mở để đổi trạng thái nhận đơn.");
    }
    mutationLock.current = true;
    setChanging(true);
    setPreflight(null);
    setPreflightError(null);
    try {
      const result = await updateShiftOrdering(posId, snapshot.shiftId, target);
      setSnapshot(result);
      return result;
    } catch (error) {
      await refreshStatus().catch(() => { });
      throw error;
    } finally {
      mutationLock.current = false;
      setChanging(false);
    }
  }, [posId, snapshot, refreshStatus]);

  const checkClose = useCallback(async (special) => {
    if (!posId || !snapshot?.shiftId || snapshot.shiftStatus !== "OPENED") {
      throw new Error("Chỉ kiểm tra đóng ca khi ca đang mở.");
    }
    setPreflight(null);
    setPreflightError(null);
    setPreflightLoading(true);
    try {
      const result = await getShiftClosePreflight(posId, special);
      // Ignore preflight for a different shift; the backend may have rotated.
      if (String(result.shiftId) !== String(snapshot.shiftId)) {
        throw new Error("Ca đã thay đổi. Vui lòng tải lại trạng thái.");
      }
      setPreflight({ ...result, special: Boolean(special) });
      return result;
    } catch (error) {
      setPreflightError(error);
      throw error;
    } finally {
      setPreflightLoading(false);
    }
  }, [posId, snapshot]);

  const resetPreflight = useCallback(() => {
    setPreflight(null);
    setPreflightError(null);
  }, []);

  return {
    snapshot, statusLoading, statusError, changing,
    preflight, preflightLoading, preflightError,
    refreshStatus, changeAcceptance, checkClose, resetPreflight,
  };
}
