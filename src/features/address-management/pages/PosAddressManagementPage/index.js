import React, { useEffect, useMemo, useState } from "react";

import { Button } from "antd";

import { ReloadOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppSelect from "../../../../shared/components/AppSelect";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import { PosAddressFeeModal, PosAddressTable } from "../../components";

import { usePosAddresses } from "../../hooks";

import SearchInput from "../../../../shared/components/SearchInput";

import "./PosAddressManagementPage.scss";

function PosAddressManagementPage() {
  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone || "";

  /* ========================================
     Business state
  ======================================== */

  const {
    kitchens,

    selectedKitchenId,

    posName,

    handleKitchenSelect,

    kitchensLoading,

    kitchensError,

    filteredAddresses,

    searchValue,

    hasSearch,

    setSearchValue,

    addressesLoading,

    addressesError,

    refreshAddresses,

    mutationAction,

    mutationPosAgencyId,

    isMutating,

    updateShippingFee,

    deactivatePosAddress,
  } = usePosAddresses(managerPhone);

  /* ========================================
     UI state
  ======================================== */

  const [feeRecord, setFeeRecord] = useState(null);

  const [deactivateRecord, setDeactivateRecord] = useState(null);

  /*
   * Đổi trung tâm
   * → đóng modal của trung tâm cũ.
   */
  useEffect(() => {
    setFeeRecord(null);

    setDeactivateRecord(null);
  }, [selectedKitchenId]);

  /* ========================================
     Derived state
  ======================================== */

  const loading = kitchensLoading || addressesLoading;

  const tableError = kitchensError || addressesError;

  const isUpdatingFee = mutationAction === "update-fee";

  const isDeactivating = mutationAction === "deactivate";

  const hasSelectedKitchen = selectedKitchenId != null;

  const emptyDescription = useMemo(() => {
    if (kitchensLoading) {
      return "Đang tải danh sách trung tâm...";
    }

    if (kitchens.length === 0) {
      return "Tài khoản quản lý hiện tại chưa có trung tâm.";
    }

    if (!hasSelectedKitchen) {
      return "Vui lòng chọn trung tâm.";
    }

    if (hasSearch) {
      return "Không tìm thấy địa chỉ phù hợp với từ khóa hiện tại.";
    }

    return "Trung tâm này chưa có địa chỉ giao hàng.";
  }, [hasSearch, hasSelectedKitchen, kitchens.length, kitchensLoading]);

  /* ========================================
     Refresh
  ======================================== */

  const handleRefresh = async () => {
    if (!hasSelectedKitchen) {
      return;
    }

    try {
      await refreshAddresses();
    } catch (error) {
      toast.error({
        message: "Không thể làm mới dữ liệu",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Copy order link
  ======================================== */

  const handleCopyLink = async (record) => {
    const orderLink = record?.orderLink;

    if (!orderLink) {
      toast.warning({
        message: "Chưa có đường dẫn đặt hàng",

        description: "Địa chỉ này hiện chưa có đường dẫn để sao chép.",
      });

      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Trình duyệt hiện tại không hỗ trợ sao chép tự động.");
      }

      await navigator.clipboard.writeText(orderLink);

      toast.success({
        message: "Đã sao chép đường dẫn",

        description: "Đường dẫn đặt hàng đã được lưu vào bộ nhớ tạm.",
      });
    } catch (error) {
      toast.error({
        message: "Không thể sao chép đường dẫn",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Update fee
  ======================================== */

  const handleOpenFeeEditor = (record) => {
    if (isMutating) {
      return;
    }

    setFeeRecord(record);
  };

  const handleCloseFeeEditor = () => {
    if (isUpdatingFee) {
      return;
    }

    setFeeRecord(null);
  };

  const handleSubmitFee = async (newFeeShip) => {
    if (!feeRecord) {
      return;
    }

    try {
      const result = await updateShippingFee(feeRecord, newFeeShip);

      setFeeRecord(null);

      if (result?.refreshError) {
        toast.warning({
          message: "Đã cập nhật phí giao hàng",

          description:
            "Phí đã được lưu nhưng danh sách chưa thể đồng bộ lại. Hãy bấm Làm mới.",
        });

        return;
      }

      toast.success({
        message: "Đã cập nhật phí giao hàng",

        description: "Phí giao hàng mới đã được lưu thành công.",
      });
    } catch (error) {
      toast.error({
        message: "Không thể cập nhật phí giao hàng",

        description: getErrorDescription(
          error,
          "Vui lòng kiểm tra dữ liệu và thử lại.",
        ),
      });
    }
  };

  /* ========================================
     Deactivate mapping
  ======================================== */

  const handleRequestDeactivate = (record) => {
    if (isMutating) {
      return;
    }

    setDeactivateRecord(record);
  };

  const handleCloseDeactivate = () => {
    if (isDeactivating) {
      return;
    }

    setDeactivateRecord(null);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateRecord) {
      return;
    }

    try {
      const result = await deactivatePosAddress(deactivateRecord);

      setDeactivateRecord(null);

      if (result?.refreshError) {
        toast.warning({
          message: "Đã vô hiệu hóa địa chỉ",

          description:
            "Liên kết đã được vô hiệu hóa nhưng danh sách chưa thể đồng bộ lại từ máy chủ.",
        });

        return;
      }

      toast.success({
        message: "Đã vô hiệu hóa địa chỉ",

        description: "Địa chỉ đã được loại khỏi trung tâm hiện tại.",
      });
    } catch (error) {
      toast.error({
        message: "Không thể vô hiệu hóa địa chỉ",

        description: getErrorDescription(error, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="pos-address-management-page">
      <ManagementPageHeader
        title="Địa chỉ theo trung tâm"
        actions={
          <div className="pos-address-management-page__header-actions">
            <AppSelect
              size="lg"
              width={230}
              value={selectedKitchenId ?? undefined}
              options={kitchens}
              loading={kitchensLoading}
              disabled={kitchensLoading || kitchens.length === 0 || isMutating}
              placeholder={
                kitchensLoading
                  ? "Đang tải trung tâm..."
                  : kitchens.length > 0
                    ? "Chọn trung tâm"
                    : "Không có trung tâm"
              }
              className="pos-address-management-page__kitchen"
              onChange={handleKitchenSelect}
            />

            <SearchInput
              size="lg"
              allowClear
              value={searchValue}
              disabled={!hasSelectedKitchen}
              placeholder="Tìm địa chỉ hoặc đơn vị..."
              className="pos-address-management-page__search"
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
            />

            <Button
              icon={<ReloadOutlined />}
              loading={addressesLoading}
              disabled={!hasSelectedKitchen || isMutating}
              className="pos-address-management-page__refresh"
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
          </div>
        }
      />

      <PosAddressTable
        addresses={filteredAddresses}
        loading={loading}
        error={tableError}
        resetPageKey={`${selectedKitchenId ?? ""}-${searchValue}`}
        mutationPosAgencyId={mutationPosAgencyId}
        isMutating={isMutating}
        emptyDescription={emptyDescription}
        onCopyLink={handleCopyLink}
        onEditFee={handleOpenFeeEditor}
        onDeactivate={handleRequestDeactivate}
        onRetry={kitchensError ? undefined : handleRefresh}
      />

      <PosAddressFeeModal
        open={Boolean(feeRecord)}
        record={feeRecord}
        loading={isUpdatingFee}
        onCancel={handleCloseFeeEditor}
        onSubmit={handleSubmitFee}
      />

      <ConfirmModal
        open={Boolean(deactivateRecord)}
        title="Vô hiệu hóa địa chỉ khỏi trung tâm?"
        danger
        loading={isDeactivating}
        confirmText="Vô hiệu hóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDeactivate}
        onCancel={handleCloseDeactivate}
      >
        <div className="pos-address-management-page__confirm">
          <p>
            Địa chỉ <strong>{deactivateRecord?.address || "đang chọn"}</strong>{" "}
            sẽ được loại khỏi <strong>{posName || "trung tâm hiện tại"}</strong>
            .
          </p>

          <p className="pos-address-management-page__confirm-note">
            Địa chỉ gốc không bị xóa. Chỉ liên kết giữa địa chỉ và trung tâm
            được vô hiệu hóa.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default PosAddressManagementPage;
