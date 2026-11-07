import { useState } from "react";

import { PlusOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";

import toast from "../../../../shared/components/AppToast";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import { PosFormModal, PosTable } from "../../components";

import { usePosActions, usePosList } from "../../hooks";

import "./PosManagementPage.scss";

function PosManagementPage() {
  const [posNameToDeactivate, setPosNameToDeactivate] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedPos, setSelectedPos] = useState(null);

  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone;

  const { posList, loading, error, refresh } = usePosList(managerPhone);

  const handleRetry = () => {
    refresh().catch(() => {});
  };

  const {
    creating,
    updatingPosId,
    deactivatingPosName,

    createPos,
    updatePos,
    deactivatePos,
  } = usePosActions({
    managerPhone,

    onCreated: refresh,

    onUpdated: refresh,

    onDeactivated: refresh,
  });

  /* ========================================
     Create
  ======================================== */

  const handleCreate = async (values) => {
    try {
      await createPos(values);

      toast.success({
        title: "Đã thêm trung tâm",

        description: "Trung tâm mới đã được tạo thành công.",
      });

      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating POS:", error);

      toast.error({
        title: "Không thể thêm trung tâm",

        description: error?.response?.data?.message || "Vui lòng thử lại.",
      });

      throw error;
    }
  };

  /* ========================================
     Edit
  ======================================== */

  const handleEdit = (pos) => {
    setSelectedPos(pos);
  };

  const handleUpdate = async (values) => {
    if (!selectedPos) {
      return;
    }

    try {
      await updatePos(selectedPos.posId, values);

      toast.success({
        title: "Đã cập nhật trung tâm",
      });

      setSelectedPos(null);
    } catch (error) {
      console.error("Error updating POS:", error);

      toast.error({
        title: "Không thể cập nhật trung tâm",

        description: error?.response?.data?.message || "Vui lòng thử lại.",
      });

      throw error;
    }
  };

  /* ========================================
     Deactivate
  ======================================== */

  const handleDeactivate = (posName) => {
    setPosNameToDeactivate(posName);
  };

  const handleConfirmDeactivate = async () => {
    if (!posNameToDeactivate) {
      return;
    }

    try {
      await deactivatePos(posNameToDeactivate);

      toast.success({
        title: "Đã xóa trung tâm",
      });

      setPosNameToDeactivate(null);
    } catch (error) {
      console.error("Error deactivating POS:", error);

      toast.error({
        title: "Không thể xóa trung tâm",

        description: error?.response?.data?.message || "Vui lòng thử lại.",
      });

      throw error;
    }
  };

  return (
    <section className="pos-management-page">
      <ManagementPageHeader
        title="Danh sách trung tâm"
        description="Quản lý thông tin các trung tâm thuộc tài khoản của bạn."
        actions={
          <AppButton
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Thêm trung tâm
          </AppButton>
        }
      />

      <div className="pos-management-page__content">
        <PosTable
          posList={posList}
          loading={loading}
          error={error}
          updatingPosId={updatingPosId}
          deactivatingPosName={deactivatingPosName}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onRetry={handleRetry}
        />
      </div>

      <PosFormModal
        open={createModalOpen}
        mode="create"
        defaultPhone={managerPhone || ""}
        submitting={creating}
        onSubmit={handleCreate}
        onClose={() => setCreateModalOpen(false)}
      />

      <PosFormModal
        open={Boolean(selectedPos)}
        mode="edit"
        pos={selectedPos}
        submitting={Boolean(updatingPosId)}
        onSubmit={handleUpdate}
        onClose={() => setSelectedPos(null)}
      />

      <ConfirmModal
        open={Boolean(posNameToDeactivate)}
        title="Xóa trung tâm"
        description={
          posNameToDeactivate
            ? `Bạn có chắc chắn muốn xóa trung tâm "${posNameToDeactivate}"?`
            : ""
        }
        cancelText="Quay lại"
        confirmText="Xóa trung tâm"
        danger
        loading={deactivatingPosName === posNameToDeactivate}
        onCancel={() => setPosNameToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </section>
  );
}

export default PosManagementPage;
