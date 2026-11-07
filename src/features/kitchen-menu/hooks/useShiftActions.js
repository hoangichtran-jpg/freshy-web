import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  closeKitchenShift,
  openKitchenShift,
} from "../api";


const hasValidPosId = (
  posId,
) =>
  posId !== null &&
  posId !== undefined &&
  posId !== "";


export default function useShiftActions() {
  const [
    openingShift,
    setOpeningShift,
  ] = useState(false);

  const [
    closingShift,
    setClosingShift,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  const openingRef =
    useRef(false);

  const closingRef =
    useRef(false);


  const openShift =
    useCallback(
      async (
        posId,
        payload,
      ) => {
        if (
          !hasValidPosId(
            posId,
          )
        ) {
          throw new Error(
            "posId is required.",
          );
        }


        if (
          openingRef.current
        ) {
          return null;
        }


        openingRef.current =
          true;

        setOpeningShift(
          true,
        );

        setError(null);


        try {
          return await openKitchenShift(
            posId,
            payload,
          );
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          openingRef.current =
            false;

          setOpeningShift(
            false,
          );
        }
      },
      [],
    );


  const closeShift =
    useCallback(
      async (
        posId,
        isSpecial,
      ) => {
        if (
          !hasValidPosId(
            posId,
          )
        ) {
          throw new Error(
            "posId is required.",
          );
        }


        if (
          closingRef.current
        ) {
          return null;
        }


        closingRef.current =
          true;

        setClosingShift(
          true,
        );

        setError(null);


        try {
          return await closeKitchenShift(
            posId,
            isSpecial,
          );
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          closingRef.current =
            false;

          setClosingShift(
            false,
          );
        }
      },
      [],
    );


  const clearError =
    useCallback(
      () =>
        setError(null),
      [],
    );


  return {
    openingShift,
    closingShift,

    error,

    openShift,
    closeShift,

    clearError,
  };
}