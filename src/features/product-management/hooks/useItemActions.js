import {
  useState,
} from "react";

import {
  createItem,
  deactivateItem,
  updateItem,
} from "../api";


export default function useItemActions() {
  const [
    creatingItem,
    setCreatingItem,
  ] = useState(false);

  const [
    updatingItemId,
    setUpdatingItemId,
  ] = useState(null);

  const [
    deletingItemId,
    setDeletingItemId,
  ] = useState(null);


  const create =
    async (
      payload,
      imageFile,
    ) => {
      if (
        creatingItem
      ) {
        return null;
      }

      setCreatingItem(
        true,
      );

      try {
        return await createItem(
          payload,
          imageFile,
        );
      } finally {
        setCreatingItem(
          false,
        );
      }
    };


  const update =
    async (
      payload,
      imageFile,
    ) => {
      const itemId =
        payload?.itemId;

      if (
        updatingItemId ===
        itemId
      ) {
        return null;
      }

      setUpdatingItemId(
        itemId,
      );

      try {
        return await updateItem(
          payload,
          imageFile,
        );
      } finally {
        setUpdatingItemId(
          null,
        );
      }
    };


  const remove =
    async (
      item,
    ) => {
      const itemId =
        item?.itemId;

      if (
        deletingItemId ===
        itemId
      ) {
        return null;
      }

      setDeletingItemId(
        itemId,
      );

      try {
        return await deactivateItem(
          item.name,
        );
      } finally {
        setDeletingItemId(
          null,
        );
      }
    };


  return {
    creatingItem,
    updatingItemId,
    deletingItemId,

    createItem:
      create,

    updateItem:
      update,

    deleteItem:
      remove,
  };
}