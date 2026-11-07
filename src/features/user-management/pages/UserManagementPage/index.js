import React, { useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button } from "antd";

import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import { ManagedUserFormModal, ManagedUsersTable, UserKitchenAssignmentModal } from "../../components";

import {
  useManagedUserActions,
  useManagedUserEditor,
  useManagedUsers,
  useUserKitchenAssignments,
} from "../../hooks";

import { USER_MANAGEMENT_TYPES } from "../../constants";

import SearchInput from "../../../../shared/components/SearchInput";

import "./UserManagementPage.scss";

const getFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

const findUserByPhone = (users, phoneNumber) =>
  (users || []).find((user) => user?.phoneNumber === phoneNumber) || null;

function UserManagementPage({ type, showKitchens }) {
  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone || "";

  const {
    config,

    filteredUsers,

    total,

    searchValue,

    loading,

    error,

    hasSearch,

    setSearchValue,

    refreshUsers,

    removeUserByPhone,
  } = useManagedUsers(type, managerPhone);

  const [userToDelete, setUserToDelete] = useState(null);

  const [editorState, setEditorState] = useState({
    mode: "create",

    user: null,

    open: false,
  });

  const [assignmentUser, setAssignmentUser] = useState(null);

  const {
    deletingPhone,

    isDeleting,

    deleteUser,
  } = useManagedUserActions(type, {
    onDeleted: removeUserByPhone,
  });

  const {
    isSaving,

    createUser,

    updateUser,
  } = useManagedUserEditor(type);

  const {
    kitchens,

    kitchensLoading,

    kitchensError,

    mutationAction,

    isMutating,

    refreshKitchens,

    addKitchens,

    removeKitchens,
  } = useUserKitchenAssignments(type, managerPhone);

  const deleteUserName = useMemo(() => {
    if (!userToDelete) {
      return "";
    }

    return (
      getFullName(userToDelete) || userToDelete?.phoneNumber || "người dùng này"
    );
  }, [userToDelete]);

  const emptyDescription = hasSearch
    ? "Không tìm thấy người dùng phù hợp với từ khóa hiện tại."
    : `Chưa có ${config?.entityLabel || "người dùng"} nào.`;

  /* ========================================
     Refresh
  ======================================== */

  const handleRefresh = async () => {
    try {
      await refreshUsers();
    } catch (refreshError) {
      toast.error({
        message: "Không thể tải lại dữ liệu",

        description: getErrorDescription(refreshError, "Vui lòng thử lại."),
      });
    }
  };

  const refreshAfterMutation = async () => {
    try {
      await refreshUsers();

      return true;
    } catch (refreshError) {
      toast.warning({
        message: "Đã lưu thay đổi",

        description:
          "Thao tác đã hoàn tất nhưng chưa thể tải lại danh sách. Hãy bấm Làm mới.",
      });

      return false;
    }
  };

  /* ========================================
     Create / Edit
  ======================================== */

  const handleOpenCreate = () => {
    setEditorState({
      mode: "create",

      user: null,

      open: true,
    });
  };

  const handleOpenEdit = (user) => {
    setEditorState({
      mode: "edit",

      user,

      open: true,
    });
  };

  const handleCloseEditor = () => {
    if (isSaving) {
      return;
    }

    setEditorState({
      mode: "create",

      user: null,

      open: false,
    });
  };

  const handleSubmitEditor = async (values) => {
    const mode = editorState.mode;

    try {
      if (mode === "create") {
        await createUser(values, managerPhone);
      } else {
        await updateUser(editorState.user, values);
      }

      setEditorState({
        mode: "create",

        user: null,

        open: false,
      });

      const refreshed = await refreshAfterMutation();

      if (refreshed) {
        toast.success({
          message:
            mode === "create"
              ? config?.createSuccessMessage
              : config?.updateSuccessMessage,
        });
      }
    } catch (saveError) {
      toast.error({
        message:
          mode === "create"
            ? config?.createErrorMessage
            : config?.updateErrorMessage,

        description: getErrorDescription(
          saveError,
          "Vui lòng kiểm tra dữ liệu và thử lại.",
        ),
      });
    }
  };

  /* ========================================
     Delete
  ======================================== */

  const handleRequestDelete = (user) => {
    if (isDeleting) {
      return;
    }

    setUserToDelete(user);
  };

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }

    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await deleteUser(userToDelete);

      setUserToDelete(null);

      toast.success({
        message: config?.deleteSuccessMessage || "Xóa người dùng thành công.",
      });
    } catch (deleteError) {
      toast.error({
        message: config?.deleteErrorMessage || "Không thể xóa người dùng.",

        description: getErrorDescription(deleteError, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Kitchen assignment
  ======================================== */

  const handleOpenKitchens = (user) => {
    setAssignmentUser(user);
  };

  const handleCloseKitchens = () => {
    if (isMutating) {
      return;
    }

    setAssignmentUser(null);
  };

  const handleRetryKitchens = async () => {
    try {
      await refreshKitchens();
    } catch (retryError) {
      toast.error({
        message: "Không thể tải danh sách bếp",

        description: getErrorDescription(retryError, "Vui lòng thử lại."),
      });
    }
  };

  const syncAssignmentUser = async (phoneNumber) => {
    try {
      const nextUsers = await refreshUsers();

      return {
        refreshed: true,

        user: findUserByPhone(nextUsers, phoneNumber),
      };
    } catch (refreshError) {
      return {
        refreshed: false,

        user: null,

        error: refreshError,
      };
    }
  };

  const handleKitchenMutationResult = async ({
    currentUser,
    result,
    successMessage,
    partialVerb,
    failureMessage,
  }) => {
    const succeededCount = result.succeededIds.length;

    const failedCount = result.failedIds.length;

    const requestedCount = result.requestedIds.length;

    /*
     * Tất cả request đều fail:
     * backend chưa thay đổi gì nên
     * giữ modal mở để user thử lại.
     */
    if (succeededCount === 0) {
      toast.error({
        message: failureMessage,

        description: getErrorDescription(
          result.firstError,
          "Vui lòng thử lại.",
        ),
      });

      return;
    }

    /*
     * Ít nhất một request đã thành công.
     * Bắt buộc refetch vì backend đã thay đổi,
     * kể cả khi batch chỉ thành công một phần.
     */
    const syncResult = await syncAssignmentUser(currentUser.phoneNumber);

    if (!syncResult.refreshed) {
      setAssignmentUser(null);

      toast.warning({
        message: failedCount > 0 ? "Đã cập nhật một phần" : successMessage,

        description:
          failedCount > 0
            ? `Đã ${partialVerb} ${succeededCount}/${requestedCount} bếp, nhưng chưa thể tải lại danh sách. Hãy bấm Làm mới.`
            : "Thao tác đã hoàn tất nhưng chưa thể tải lại danh sách. Hãy bấm Làm mới.",
      });

      return;
    }

    /*
     * Full success.
     */
    if (failedCount === 0) {
      setAssignmentUser(null);

      toast.success({
        message: successMessage,
      });

      return;
    }

    /*
     * Partial success.
     *
     * Giữ modal mở với user vừa refetch
     * để dữ liệu hiển thị đúng trạng thái backend.
     */
    setAssignmentUser(syncResult.user);

    toast.warning({
      message: "Đã cập nhật một phần",

      description: `Đã ${partialVerb} ${succeededCount}/${requestedCount} bếp. ${failedCount} bếp chưa cập nhật; bạn có thể thử lại.`,
    });
  };

  const handleAddKitchens = async (posIds) => {
    if (!assignmentUser) {
      return;
    }

    const currentUser = assignmentUser;

    try {
      const result = await addKitchens(currentUser, posIds);

      await handleKitchenMutationResult({
        currentUser,

        result,

        successMessage: "Đã phân công bếp.",

        partialVerb: "phân công",

        failureMessage: "Không thể phân công bếp",
      });
    } catch (assignmentError) {
      toast.error({
        message: "Không thể phân công bếp",

        description: getErrorDescription(assignmentError, "Vui lòng thử lại."),
      });
    }
  };

  const handleRemoveKitchens = async (posIds) => {
    if (!assignmentUser) {
      return;
    }

    const currentUser = assignmentUser;

    try {
      const result = await removeKitchens(currentUser, posIds);

      await handleKitchenMutationResult({
        currentUser,

        result,

        successMessage: "Đã bỏ phân công bếp.",

        partialVerb: "bỏ phân công",

        failureMessage: "Không thể bỏ phân công bếp",
      });
    } catch (assignmentError) {
      toast.error({
        message: "Không thể bỏ phân công bếp",

        description: getErrorDescription(assignmentError, "Vui lòng thử lại."),
      });
    }
  };

  if (!config) {
    return null;
  }

  return (
    <div className="user-management-page">
      <ManagementPageHeader
        title={config.title}
        description={`${config.description} Hiện có ${total} ${config.entityLabel}.`}
        actions={
          <div className="user-management-page__header-actions">
            <SearchInput
              size="lg"
              allowClear
              value={searchValue}
              placeholder="Tìm theo họ tên hoặc số điện thoại..."
              className="user-management-page__search"
              onChange={(event) => setSearchValue(event.target.value)}
            />

            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              className="user-management-page__refresh"
              onClick={handleRefresh}
            >
              Làm mới
            </Button>

            <AppButton
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
            >
              {config.createLabel}
            </AppButton>
          </div>
        }
      />

      <ManagedUsersTable
        users={filteredUsers}
        loading={loading}
        error={error}
        deletingPhone={deletingPhone}
        showKitchens={showKitchens}
        resetPageKey={searchValue}
        emptyDescription={emptyDescription}
        onEdit={handleOpenEdit}
        onDelete={handleRequestDelete}
        onManageKitchens={showKitchens ? handleOpenKitchens : null}
        onRetry={handleRefresh}
      />

      <ManagedUserFormModal
        open={editorState.open}
        mode={editorState.mode}
        type={type}
        user={editorState.user}
        loading={isSaving}
        onCancel={handleCloseEditor}
        onSubmit={handleSubmitEditor}
      />

      <UserKitchenAssignmentModal
        open={Boolean(assignmentUser)}
        user={assignmentUser}
        kitchens={kitchens}
        loading={kitchensLoading}
        error={kitchensError}
        mutationAction={mutationAction}
        onRetry={handleRetryKitchens}
        onAdd={handleAddKitchens}
        onRemove={handleRemoveKitchens}
        onClose={handleCloseKitchens}
      />

      <ConfirmModal
        open={Boolean(userToDelete)}
        title={config.deleteTitle}
        description={
          <>
            Bạn có chắc chắn muốn xóa <strong>{deleteUserName}</strong>
            ?
            <br />
            Thao tác này không thể hoàn tác.
          </>
        }
        confirmText="Xóa"
        cancelText="Hủy"
        danger
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
      />
    </div>
  );
}

UserManagementPage.propTypes = {
  type: PropTypes.oneOf([
    USER_MANAGEMENT_TYPES.AGENCY,
    USER_MANAGEMENT_TYPES.SHIPPER,
  ]).isRequired,

  showKitchens: PropTypes.bool,
};

UserManagementPage.defaultProps = {
  showKitchens: false,
};

export default UserManagementPage;
