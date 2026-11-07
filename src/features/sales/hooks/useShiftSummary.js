import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getShiftSummary,
} from "../api";


export const useShiftSummary = (
  posId,
) => {
  const [
    shiftSummary,
    setShiftSummary,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  /*
   * Dùng request id để tránh race condition.
   *
   * Ví dụ:
   *
   * POS A request
   * → đổi nhanh sang POS B
   * → B trả về trước
   * → A trả về sau
   *
   * Response A không được phép
   * ghi đè data của B.
   */
  const requestIdRef =
    useRef(0);


  /* ========================================
     Fetch / refresh
  ======================================== */

  const refresh =
    useCallback(async () => {
      const requestId =
        ++requestIdRef.current;


      if (
        posId == null ||
        posId === ""
      ) {
        setShiftSummary(null);
        setError(null);
        setLoading(false);

        return null;
      }


      setLoading(true);
      setError(null);


      try {
        const data =
          await getShiftSummary(
            posId,
          );


        /*
         * Request này đã cũ.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }


        setShiftSummary(data);

        return data;
      } catch (err) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return null;
        }


        setShiftSummary(null);
        setError(err);

        return null;
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    }, [posId]);


  /* ========================================
     Auto fetch when POS changes
  ======================================== */

  useEffect(() => {
    refresh();


    return () => {
      /*
       * Invalidate request cũ khi:
       *
       * - đổi POS
       * - component unmount
       */
      requestIdRef.current += 1;
    };
  }, [refresh]);


  return {
    shiftSummary,

    loading,
    error,

    refresh,
  };
};