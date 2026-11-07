import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  changeKitchenMenuStatus,
  deleteKitchenMenu,
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
        "Kitchen menu success callback failed:",
        error,
      );
    }
  };


export default function useKitchenMenuActions({
  onChanged,
  onDeleted,
} = {}) {
  const [
    changingMenuId,
    setChangingMenuId,
  ] = useState(null);

  const [
    deletingMenuId,
    setDeletingMenuId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);


  const changingRef =
    useRef(false);

  const deletingRef =
    useRef(false);


  const changeStatus =
    useCallback(
      async (
        id,
        isActive,
      ) => {
        if (
          changingRef.current
        ) {
          return null;
        }


        changingRef.current =
          true;

        setChangingMenuId(
          id,
        );

        setError(null);


        try {
          const result =
            await changeKitchenMenuStatus(
              {
                id,
                isActive,
              },
            );


          await runSuccessCallback(
            onChanged,
            result,
            id,
          );


          return result;
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          changingRef.current =
            false;

          setChangingMenuId(
            null,
          );
        }
      },
      [
        onChanged,
      ],
    );


  const deleteMenu =
    useCallback(
      async (
        id,
      ) => {
        if (
          deletingRef.current
        ) {
          return null;
        }


        deletingRef.current =
          true;

        setDeletingMenuId(
          id,
        );

        setError(null);


        try {
          const result =
            await deleteKitchenMenu(
              id,
            );


          await runSuccessCallback(
            onDeleted,
            result,
            id,
          );


          return result;
        } catch (err) {
          setError(err);

          throw err;
        } finally {
          deletingRef.current =
            false;

          setDeletingMenuId(
            null,
          );
        }
      },
      [
        onDeleted,
      ],
    );


  const clearError =
    useCallback(
      () =>
        setError(null),
      [],
    );


  return {
    changingMenuId,
    deletingMenuId,

    error,

    changeStatus,
    deleteMenu,

    clearError,
  };
}