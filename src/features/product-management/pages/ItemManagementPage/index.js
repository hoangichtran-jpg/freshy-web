import React, { useEffect, useMemo, useState } from "react";

import {
  useAuth,
} from "../../../../shared/auth";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import {
  ItemFormModal,
  ItemManagementHeader,
  ItemManagementTable,
} from "../../components";

import { useItemActions, useItems, useToppingGroups } from "../../hooks";

import "./ItemManagementPage.scss";

export default function ItemManagementPage() {
  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone;

  const {
    items,

    loading: itemsLoading,

    error: itemsError,

    refresh: refreshItems,

    removeItemLocal,
  } = useItems();

  const {
    toppingGroups,

    loading: toppingGroupsLoading,

    error: toppingGroupsError,
  } = useToppingGroups();

  const {
    creatingItem,

    updatingItemId,

    deletingItemId,

    createItem,

    updateItem,

    deleteItem,
  } = useItemActions();

  const [searchText, setSearchText] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [formMode, setFormMode] = useState("create");

  const [editingItem, setEditingItem] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    if (!itemsError) {
      return;
    }

    toast.error({
      message: "Không thể tải danh sách món ăn",

      description: getErrorDescription(itemsError, "Vui lòng thử lại."),
    });
  }, [itemsError]);

  useEffect(() => {
    if (!toppingGroupsError) {
      return;
    }

    toast.error({
      message: "Không thể tải nhóm topping",

      description: getErrorDescription(toppingGroupsError, "Vui lòng thử lại."),
    });
  }, [toppingGroupsError]);

  const displayedItems = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase("vi");

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      String(item.name || "")
        .toLocaleLowerCase("vi")
        .includes(query),
    );
  }, [items, searchText]);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      current: 1,
    }));
  }, [searchText]);

  const openCreateForm = () => {
    setEditingItem(null);

    setFormMode("create");

    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);

    setFormMode("edit");

    setFormOpen(true);
  };

  const closeForm = () => {
    if (creatingItem || updatingItemId != null) {
      return;
    }

    setFormOpen(false);

    setEditingItem(null);
  };

  const handleSubmit = async (payload, imageFile) => {
    if (formMode === "create") {
      try {
        await createItem(payload, imageFile);

        setFormOpen(false);

        toast.success({
          message: "Thêm món ăn thành công",
        });

        await refreshItems();

        return;
      } catch (error) {
        toast.error({
          message: "Không thể thêm món ăn",

          description: getErrorDescription(
            error,
            "Vui lòng kiểm tra dữ liệu và thử lại.",
          ),
        });

        return;
      }
    }

    try {
      await updateItem(payload, imageFile);

      setFormOpen(false);

      setEditingItem(null);

      toast.success({
        message: "Cập nhật món ăn thành công",
      });

      await refreshItems();
    } catch (error) {
      toast.error({
        message: "Không thể cập nhật món ăn",

        description: getErrorDescription(
          error,
          "Vui lòng kiểm tra dữ liệu và thử lại.",
        ),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      await deleteItem(itemToDelete);

      removeItemLocal(itemToDelete.itemId, itemToDelete.name);

      toast.success({
        message: "Xóa món ăn thành công",
      });

      setItemToDelete(null);
    } catch (error) {
      toast.error({
        message: "Không thể xóa món ăn",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  return (
    <div className="item-management-page">
      <ItemManagementHeader
        searchValue={searchText}
        onSearchChange={setSearchText}
        onCreate={openCreateForm}
      />

      <ItemManagementTable
        items={displayedItems}
        loading={itemsLoading}
        pagination={pagination}
        deletingItemId={deletingItemId}
        onPaginationChange={setPagination}
        onEdit={openEditForm}
        onDelete={setItemToDelete}
      />

      <ItemFormModal
        open={formOpen}
        mode={formMode}
        item={editingItem}
        toppingGroups={toppingGroups}
        toppingGroupsLoading={toppingGroupsLoading}
        submitting={
          formMode === "create"
            ? creatingItem
            : updatingItemId === editingItem?.itemId
        }
        managerPhone={managerPhone}
        onCancel={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="Xóa món ăn"
        description={
          itemToDelete
            ? `Bạn có chắc chắn muốn xóa món "${itemToDelete.name}"? Món sẽ không còn xuất hiện trong danh sách hoạt động.`
            : ""
        }
        cancelText="Quay lại"
        confirmText="Xóa món"
        danger
        loading={deletingItemId === itemToDelete?.itemId}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
