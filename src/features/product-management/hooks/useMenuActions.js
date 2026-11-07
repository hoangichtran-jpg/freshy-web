import {
  useState,
} from "react";

import {
  addMenuToKitchen,
  changeMenuStatus,
  createMenuByManager,
  updateMenuByManager,
} from "../api";


export default function useMenuActions() {
  const [
    creatingMenu,
    setCreatingMenu,
  ] = useState(false);

  const [
    updatingMenuId,
    setUpdatingMenuId,
  ] = useState(null);

  const [
    changingStatusMenuId,
    setChangingStatusMenuId,
  ] = useState(null);

  const [
    assigningMenuId,
    setAssigningMenuId,
  ] = useState(null);


  /* ========================================
     Create
  ======================================== */

  const createMenu =
    async (
      payload,
    ) => {
      if (
        creatingMenu
      ) {
        return null;
      }


      setCreatingMenu(
        true,
      );


      try {
        return await createMenuByManager(
          payload,
        );
      } finally {
        setCreatingMenu(
          false,
        );
      }
    };


  /* ========================================
     Update
  ======================================== */

  const updateMenu =
    async (
      menuId,
      payload,
    ) => {
      if (
        updatingMenuId ===
        menuId
      ) {
        return null;
      }


      setUpdatingMenuId(
        menuId,
      );


      try {
        return await updateMenuByManager(
          payload,
          menuId,
        );
      } finally {
        setUpdatingMenuId(
          null,
        );
      }
    };


  /* ========================================
     Status
  ======================================== */

  const changeStatus =
    async ({
      menuId,
      managerPhone,
      currentStatus,
    }) => {
      if (
        changingStatusMenuId ===
        menuId
      ) {
        return null;
      }


      setChangingStatusMenuId(
        menuId,
      );


      try {
        return await changeMenuStatus({
          menuId,
          managerPhone,
          currentStatus,
        });
      } finally {
        setChangingStatusMenuId(
          null,
        );
      }
    };


  /* ========================================
     Assign to kitchen
  ======================================== */

  const assignToKitchen =
    async ({
      menuId,
      managerPhone,
      posId,
    }) => {
      if (
        assigningMenuId ===
        menuId
      ) {
        return null;
      }


      setAssigningMenuId(
        menuId,
      );


      try {
        return await addMenuToKitchen({
          menuId,
          managerPhone,
          posId,
        });
      } finally {
        setAssigningMenuId(
          null,
        );
      }
    };


  return {
    creatingMenu,

    updatingMenuId,

    changingStatusMenuId,

    assigningMenuId,

    createMenu,

    updateMenu,

    changeStatus,

    assignToKitchen,
  };
}