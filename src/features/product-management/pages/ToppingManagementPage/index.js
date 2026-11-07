import React, { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../../shared/auth";

import toast from "../../../../shared/components/AppToast";

import {
  ToppingEditorModal,
  ToppingGroupFormModal,
  ToppingManagementHeader,
  ToppingManagementTable,
} from "../../components";

import { useToppingActions, useToppingGroups } from "../../hooks";

import "./ToppingManagementPage.scss";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

export default function ToppingManagementPage() {
  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone;

  const {
    toppingGroups,

    loading: groupsLoading,

    error: groupsError,

    refresh,
  } = useToppingGroups();

  const {
    creatingGroup,

    updatingGroupId,

    updatingToppingsGroupId,

    createGroup,

    updateGroup,

    updateToppings,
  } = useToppingActions();

  const [searchText, setSearchText] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,

    pageSize: 10,
  });

  const [groupFormOpen, setGroupFormOpen] = useState(false);

  const [groupFormMode, setGroupFormMode] = useState("create");

  const [editingGroup, setEditingGroup] = useState(null);

  const [toppingEditorGroup, setToppingEditorGroup] = useState(null);

  useEffect(() => {
    if (!groupsError) {
      return;
    }

    toast.error({
      message: "Không thể tải danh sách nhóm topping",

      description: getErrorDescription(groupsError, "Vui lòng thử lại."),
    });
  }, [groupsError]);

  const displayedGroups = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase("vi");

    if (!query) {
      return toppingGroups;
    }

    return toppingGroups.filter((group) => {
      const groupMatch = String(group.name || "")
        .toLocaleLowerCase("vi")
        .includes(query);

      const toppingMatch = (group.toppings || []).some((topping) =>
        String(topping.toppingName || "")
          .toLocaleLowerCase("vi")
          .includes(query),
      );

      return groupMatch || toppingMatch;
    });
  }, [toppingGroups, searchText]);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,

      current: 1,
    }));
  }, [searchText]);

  const openCreateGroup = () => {
    setEditingGroup(null);

    setGroupFormMode("create");

    setGroupFormOpen(true);
  };

  const openEditGroup = (group) => {
    setEditingGroup(group);

    setGroupFormMode("edit");

    setGroupFormOpen(true);
  };

  const closeGroupForm = () => {
    if (creatingGroup || updatingGroupId != null) {
      return;
    }

    setGroupFormOpen(false);

    setEditingGroup(null);
  };

  const handleGroupSubmit = async (payload) => {
    if (groupFormMode === "create") {
      try {
        await createGroup(payload);

        setGroupFormOpen(false);

        toast.success({
          message: "Tạo nhóm topping thành công",
        });

        await refresh();

        return;
      } catch (error) {
        toast.error({
          message: "Không thể tạo nhóm topping",

          description: getErrorDescription(
            error,
            "Vui lòng kiểm tra dữ liệu và thử lại.",
          ),
        });

        return;
      }
    }

    if (!editingGroup) {
      return;
    }

    try {
      await updateGroup(editingGroup.id, payload);

      setGroupFormOpen(false);

      setEditingGroup(null);

      toast.success({
        message: "Cập nhật nhóm topping thành công",
      });

      await refresh();
    } catch (error) {
      toast.error({
        message: "Không thể cập nhật nhóm topping",

        description: getErrorDescription(
          error,
          "Vui lòng kiểm tra dữ liệu và thử lại.",
        ),
      });
    }
  };

  const handleToppingsSubmit = async (payload) => {
    if (!toppingEditorGroup) {
      return;
    }

    const groupId = toppingEditorGroup.id;

    try {
      const response = await updateToppings(groupId, payload);

      if (
        response?.status != null &&
        response.status !== 200 &&
        response.status !== 204
      ) {
        throw new Error("Máy chủ không xác nhận cập nhật topping.");
      }

      setToppingEditorGroup(null);

      toast.success({
        message: "Cập nhật topping thành công",
      });

      await refresh();
    } catch (error) {
      toast.error({
        message: "Không thể cập nhật topping",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  return (
    <div className="topping-management-page">
      <ToppingManagementHeader
        searchValue={searchText}
        onSearchChange={setSearchText}
        onCreate={openCreateGroup}
      />

      <ToppingManagementTable
        groups={displayedGroups}
        loading={groupsLoading}
        pagination={pagination}
        updatingGroupId={updatingGroupId}
        updatingToppingsGroupId={updatingToppingsGroupId}
        onPaginationChange={setPagination}
        onEditGroup={openEditGroup}
        onManageToppings={setToppingEditorGroup}
      />

      <ToppingGroupFormModal
        open={groupFormOpen}
        mode={groupFormMode}
        group={editingGroup}
        managerPhone={managerPhone}
        submitting={
          groupFormMode === "create"
            ? creatingGroup
            : updatingGroupId === editingGroup?.id
        }
        onCancel={closeGroupForm}
        onSubmit={handleGroupSubmit}
      />

      <ToppingEditorModal
        open={Boolean(toppingEditorGroup)}
        group={toppingEditorGroup}
        submitting={updatingToppingsGroupId === toppingEditorGroup?.id}
        onCancel={() => {
          if (updatingToppingsGroupId != null) {
            return;
          }

          setToppingEditorGroup(null);
        }}
        onSubmit={handleToppingsSubmit}
      />
    </div>
  );
}
