import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  createPos as createPosApi,
  deactivatePos as deactivatePosApi,
  updatePos as updatePosApi,
} from "../api";


const runSuccessCallback =
  async (
    callback,
    ...args
  ) => {
    if (!callback) {
      return;
    }

    try {
      await callback(
        ...args,
      );
    } catch (error) {
      console.error(
        "POS success callback failed:",
        error,
      );
    }
  };


export default function usePosActions({
  managerPhone,
  onCreated,
  onUpdated,
  onDeactivated,
} = {}) {
  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    updatingPosId,
    setUpdatingPosId,
  ] = useState(null);

  const [
    deactivatingPosName,
    setDeactivatingPosName,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);


  const creatingRef =
    useRef(false);

  const updatingRef =
    useRef(false);

  const deactivatingRef =
    useRef(false);


  const createPos =
    useCallback(
      async (data) => {
        if (!managerPhone) {
          throw new Error(
            "Manager phone is required.",
          );
        }

        if (
          creatingRef.current
        ) {
          return null;
        }

        creatingRef.current =
          true;

        setCreating(true);
        setError(null);

        try {
          const createdPos =
            await createPosApi(
              managerPhone,
              data,
            );

          await runSuccessCallback(
            onCreated,
            createdPos,
          );

          return createdPos;
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          creatingRef.current =
            false;

          setCreating(false);
        }
      },
      [
        managerPhone,
        onCreated,
      ],
    );


  const updatePos =
    useCallback(
      async (
        posId,
        data,
      ) => {
        if (
          updatingRef.current
        ) {
          return null;
        }

        updatingRef.current =
          true;

        setUpdatingPosId(
          posId,
        );

        setError(null);

        try {
          const updatedPos =
            await updatePosApi(
              posId,
              data,
            );

          await runSuccessCallback(
            onUpdated,
            updatedPos,
            posId,
          );

          return updatedPos;
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          updatingRef.current =
            false;

          setUpdatingPosId(
            null,
          );
        }
      },
      [onUpdated],
    );


  const deactivatePos =
    useCallback(
      async (
        posName,
      ) => {
        if (
          deactivatingRef.current
        ) {
          return null;
        }

        deactivatingRef.current =
          true;

        setDeactivatingPosName(
          posName,
        );

        setError(null);

        try {
          const result =
            await deactivatePosApi(
              posName,
            );

          await runSuccessCallback(
            onDeactivated,
            result,
            posName,
          );

          return result;
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          deactivatingRef.current =
            false;

          setDeactivatingPosName(
            null,
          );
        }
      },
      [onDeactivated],
    );


  const clearError =
    useCallback(
      () => {
        setError(null);
      },
      [],
    );


  return {
    creating,

    updatingPosId,

    deactivatingPosName,

    error,

    createPos,

    updatePos,

    deactivatePos,

    clearError,
  };
}