import {
  useState,
} from "react";

import {
  createGroupTopping,
  updateAndDeleteToppings,
  updateGroupTopping,
} from "../api";


export default function useToppingActions() {
  const [
    creatingGroup,
    setCreatingGroup,
  ] = useState(false);

  const [
    updatingGroupId,
    setUpdatingGroupId,
  ] = useState(null);

  const [
    updatingToppingsGroupId,
    setUpdatingToppingsGroupId,
  ] = useState(null);


  const createGroup =
    async (
      payload,
    ) => {
      if (
        creatingGroup
      ) {
        return null;
      }

      setCreatingGroup(
        true,
      );

      try {
        return await createGroupTopping(
          payload,
        );
      } finally {
        setCreatingGroup(
          false,
        );
      }
    };


  const updateGroup =
    async (
      groupId,
      payload,
    ) => {
      if (
        updatingGroupId ===
        groupId
      ) {
        return null;
      }

      setUpdatingGroupId(
        groupId,
      );

      try {
        return await updateGroupTopping(
          payload,
          groupId,
        );
      } finally {
        setUpdatingGroupId(
          null,
        );
      }
    };


  const updateToppings =
    async (
      groupId,
      payload,
    ) => {
      if (
        updatingToppingsGroupId ===
        groupId
      ) {
        return null;
      }

      setUpdatingToppingsGroupId(
        groupId,
      );

      try {
        return await updateAndDeleteToppings(
          payload,
        );
      } finally {
        setUpdatingToppingsGroupId(
          null,
        );
      }
    };


  return {
    creatingGroup,
    updatingGroupId,
    updatingToppingsGroupId,

    createGroup,
    updateGroup,
    updateToppings,
  };
}