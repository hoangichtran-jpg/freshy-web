import React, { useEffect, useMemo, useState } from "react";

import {
  useAuth,
} from "../../../../shared/auth";

import toast from "../../../../shared/components/AppToast";

import { useKitchens } from "../../../../shared/hooks";

import {
  AssignMenuModal,
  MenuFormModal,
  MenuManagementHeader,
  MenuManagementTable,
} from "../../components";

import { useActiveItems, useMenuActions, useMenus } from "../../hooks";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import "./MenuManagementPage.scss";

export default function MenuManagementPage() {
  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone;

  /* ========================================
     Menus
  ======================================== */

  const {
    menus,

    loading: menusLoading,

    error: menusError,

    pagination,

    fetchMenus,

    changePage,

    refresh,

    updateMenuLocal,
  } = useMenus(managerPhone);

  /* ========================================
     Active items
  ======================================== */

  const {
    items,

    loading: itemsLoading,

    error: itemsError,
  } = useActiveItems();

  /* ========================================
     Kitchens
  ======================================== */

  const {
    kitchens,

    selectedKitchenId: defaultKitchenId,

    loading: kitchensLoading,

    error: kitchensError,
  } = useKitchens(managerPhone);

  /* ========================================
     Actions
  ======================================== */

  const {
    creatingMenu,

    updatingMenuId,

    changingStatusMenuId,

    assigningMenuId,

    createMenu,

    updateMenu,

    changeStatus,

    assignToKitchen,
  } = useMenuActions();

  /* ========================================
     Local UI
  ======================================== */

  const [searchText, setSearchText] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [formMode, setFormMode] = useState("create");

  const [editingMenu, setEditingMenu] = useState(null);

  const [assignMenu, setAssignMenu] = useState(null);

  const [assignKitchenId, setAssignKitchenId] = useState(null);

  /* ========================================
     Errors
  ======================================== */

  useEffect(() => {
    if (!menusError) {
      return;
    }

    toast.error({
      message: "Không thể tải danh sách thực đơn",

      description: getErrorDescription(menusError, "Vui lòng thử lại."),
    });
  }, [menusError]);

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
    if (!kitchensError) {
      return;
    }

    toast.error({
      message: "Không thể tải danh sách trung tâm",

      description: getErrorDescription(kitchensError, "Vui lòng thử lại."),
    });
  }, [kitchensError]);

  /* ========================================
     Sort

     Priority:
     1. Active trước
     2. Menu ID lớn hơn trước

     Không mutate `menus` gốc.
  ======================================== */

  const sortedMenus = useMemo(() => {
    return [...menus].sort((first, second) => {
      const firstActive = Boolean(first?.isActive);

      const secondActive = Boolean(second?.isActive);

      /* ========================================
               Active trước inactive
            ======================================== */

      if (firstActive !== secondActive) {
        return secondActive ? 1 : -1;
      }

      /* ========================================
               Cùng status:
               menu mới hơn trước
            ======================================== */

      const firstId = Number(first?.menuId) || 0;

      const secondId = Number(second?.menuId) || 0;

      return secondId - firstId;
    });
  }, [menus]);

  /* ========================================
     Search

     Search trên FULL DATASET đã sort,
     không chỉ 10 row của current page.
  ======================================== */

  const displayedMenus = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase("vi");

    if (!query) {
      return sortedMenus;
    }

    return sortedMenus.filter((menu) =>
      String(menu?.menuName || "")
        .toLocaleLowerCase("vi")
        .includes(query),
    );
  }, [sortedMenus, searchText]);

  /* ========================================
     Table pagination

     Khi search:
     total phải bằng số kết quả search.
  ======================================== */

  const tablePagination = useMemo(
    () => ({
      ...pagination,

      total: displayedMenus.length,
    }),
    [pagination, displayedMenus.length],
  );

  /* ========================================
     Search handler
  ======================================== */

  const handleSearchChange = (value) => {
    setSearchText(value);

    changePage(1, pagination.pageSize).catch(() => {});
  };

  /* ========================================
     Form
  ======================================== */

  const openCreateForm = () => {
    setEditingMenu(null);

    setFormMode("create");

    setFormOpen(true);
  };

  const openEditForm = (menu) => {
    setEditingMenu(menu);

    setFormMode("edit");

    setFormOpen(true);
  };

  const closeForm = () => {
    if (creatingMenu || updatingMenuId != null) {
      return;
    }

    setFormOpen(false);

    setEditingMenu(null);
  };

  const handleFormSubmit = async (values) => {
    /* ========================================
         Create
      ======================================== */

    if (formMode === "create") {
      try {
        await createMenu({
          ...values,

          managerPhone,
        });

        setFormOpen(false);

        toast.success({
          message: "Tạo thực đơn thành công",
        });

        await fetchMenus({
          page: 1,

          pageSize: pagination.pageSize,
        });

        return;
      } catch (error) {
        toast.error({
          message: "Không thể tạo thực đơn",

          description: getErrorDescription(
            error,
            "Vui lòng kiểm tra dữ liệu và thử lại.",
          ),
        });

        return;
      }
    }

    /* ========================================
         Update
      ======================================== */

    if (!editingMenu) {
      return;
    }

    try {
      await updateMenu(editingMenu.menuId, values);

      setFormOpen(false);

      setEditingMenu(null);

      toast.success({
        message: "Cập nhật thực đơn thành công",
      });

      await refresh();
    } catch (error) {
      toast.error({
        message: "Không thể cập nhật thực đơn",

        description: getErrorDescription(
          error,
          "Vui lòng kiểm tra dữ liệu và thử lại.",
        ),
      });
    }
  };

  /* ========================================
     Status
  ======================================== */

  const handleStatusChange = async (menu, checked) => {
    const menuId = menu.menuId;

    const previousStatus = Boolean(menu.isActive);

    /*
     * Update local trước.
     *
     * Vì sortedMenus phụ thuộc isActive,
     * row sẽ tự chuyển nhóm ngay.
     */
    updateMenuLocal(menuId, {
      isActive: checked,
    });

    try {
      await changeStatus({
        menuId,

        managerPhone,

        currentStatus: previousStatus,
      });
    } catch (error) {
      /*
       * Rollback nếu request fail.
       */
      updateMenuLocal(menuId, {
        isActive: previousStatus,
      });

      toast.error({
        message: "Không thể cập nhật trạng thái",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Assign to kitchen
  ======================================== */

  const openAssignModal = (menu) => {
    setAssignMenu(menu);

    setAssignKitchenId(defaultKitchenId ?? kitchens[0]?.value ?? null);
  };

  const closeAssignModal = () => {
    if (assigningMenuId != null) {
      return;
    }

    setAssignMenu(null);

    setAssignKitchenId(null);
  };

  const handleAssign = async () => {
    if (!assignMenu || !assignKitchenId) {
      toast.warning({
        message: "Chưa chọn trung tâm",

        description: "Hãy chọn trung tâm trước khi tiếp tục.",
      });

      return;
    }

    try {
      await assignToKitchen({
        menuId: assignMenu.menuId,

        managerPhone,

        posId: assignKitchenId,
      });

      toast.success({
        message: "Đã thêm thực đơn vào trung tâm",
      });

      setAssignMenu(null);

      setAssignKitchenId(null);
    } catch (error) {
      toast.error({
        message: "Không thể thêm thực đơn vào trung tâm",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="menu-management-page">
      <MenuManagementHeader
        searchValue={searchText}
        onSearchChange={handleSearchChange}
        onCreate={openCreateForm}
      />

      <MenuManagementTable
        menus={displayedMenus}
        loading={menusLoading}
        pagination={tablePagination}
        changingStatusMenuId={changingStatusMenuId}
        assigningMenuId={assigningMenuId}
        onPageChange={(page, pageSize) => {
          changePage(page, pageSize).catch(() => {});
        }}
        onStatusChange={handleStatusChange}
        onEdit={openEditForm}
        onAssign={openAssignModal}
      />

      <MenuFormModal
        open={formOpen}
        mode={formMode}
        menu={editingMenu}
        items={items}
        itemsLoading={itemsLoading}
        submitting={
          formMode === "create"
            ? creatingMenu
            : updatingMenuId === editingMenu?.menuId
        }
        onCancel={closeForm}
        onSubmit={handleFormSubmit}
      />

      <AssignMenuModal
        open={Boolean(assignMenu)}
        menu={assignMenu}
        kitchens={kitchens}
        selectedKitchenId={assignKitchenId}
        loading={assigningMenuId === assignMenu?.menuId}
        kitchensLoading={kitchensLoading}
        onKitchenChange={setAssignKitchenId}
        onCancel={closeAssignModal}
        onConfirm={handleAssign}
      />
    </div>
  );
}
