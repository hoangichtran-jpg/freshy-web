import React, { useMemo, useState } from "react";

import { Button } from "antd";

import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";

import { useKitchens } from "../../../../shared/hooks";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import {
  AddressFormModal,
  AddressManagementTable,
  AddressOrderInfoModal,
  AddressPosAssignmentModal,
} from "../../components";

import {
  useAddressAgencies,
  useAddressAgencyAssignment,
  useAddressMutations,
  useAddressPosAssignment,
  useManagedAddresses,
} from "../../hooks";

import SearchInput from "../../../../shared/components/SearchInput";

import "./AddressManagementPage.scss";

function AddressManagementPage() {
  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone || "";

  /* ========================================
     Kitchens / POS
  ======================================== */

  const {
    kitchens,

    loading: kitchensLoading,

    error: kitchensError,
  } = useKitchens(managerPhone);

  /* ========================================
     Agencies
  ======================================== */

  const {
    agencies,

    loading: agenciesLoading,

    refreshAgencies,

    getAgencyById,
  } = useAddressAgencies(managerPhone);

  /* ========================================
     Addresses
  ======================================== */

  const {
    filteredAddresses,

    searchValue,

    loading: addressesLoading,

    error: addressesError,

    hasSearch,

    setSearchValue,

    refreshAddresses,

    removeAddressById,
  } = useManagedAddresses(managerPhone, agencies);

  /* ========================================
     UI state
  ======================================== */

  const [editorState, setEditorState] = useState({
    open: false,

    mode: "create",

    address: null,
  });

  const [addressToDeactivate, setAddressToDeactivate] = useState(null);

  const [orderInfoAddress, setOrderInfoAddress] = useState(null);

  const [posAssignmentAddress, setPosAssignmentAddress] = useState(null);

  /* ========================================
     Address mutations
  ======================================== */

  const {
    mutationAddressId,

    isMutating,

    isCreating,

    isUpdating,

    isDeactivating,

    createManagedAddress,

    updateManagedAddress,

    deactivateManagedAddress,
  } = useAddressMutations(managerPhone, {
    onDeactivated: removeAddressById,
  });

  /* ========================================
     Agency / order-info
  ======================================== */

  const {
    savingAddressId,

    isSaving: isSavingOrderInfo,

    saveAgencyInfo,
  } = useAddressAgencyAssignment();

  /* ========================================
     POS assignment
  ======================================== */

  const {
    assigningAddressId,

    isAssigning,

    assignAddressToPos,
  } = useAddressPosAssignment();

  /* ========================================
     Busy state
  ======================================== */

  const busy = isMutating || isSavingOrderInfo || isAssigning;

  const activeMutationAddressId =
    assigningAddressId ?? savingAddressId ?? mutationAddressId;

  const loading = addressesLoading || agenciesLoading;

  const editorLoading = isCreating || isUpdating;

  /* ========================================
     Derived UI
  ======================================== */

  const emptyDescription = hasSearch
    ? "Không tìm thấy địa chỉ phù hợp với từ khóa hiện tại."
    : "Chưa có địa chỉ nào.";

  const deactivateAddressName = useMemo(
    () => addressToDeactivate?.addressName || "địa chỉ này",
    [addressToDeactivate],
  );

  /* ========================================
     Refresh
  ======================================== */

  const handleRefresh = async () => {
    const results = await Promise.allSettled([
      refreshAddresses(),

      refreshAgencies(),
    ]);

    const failed = results.filter((result) => result.status === "rejected");

    if (failed.length === 0) {
      return;
    }

    if (failed.length === results.length) {
      toast.error({
        message: "Không thể tải lại dữ liệu",

        description:
          "Danh sách địa chỉ và đại lý chưa thể làm mới. Vui lòng thử lại.",
      });

      return;
    }

    toast.warning({
      message: "Dữ liệu chưa được tải đầy đủ",

      description: "Một phần dữ liệu chưa thể làm mới. Vui lòng thử lại.",
    });
  };

  const refreshAfterMutation = async () => {
    try {
      await refreshAddresses();

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
    if (busy) {
      return;
    }

    setEditorState({
      open: true,

      mode: "create",

      address: null,
    });
  };

  const handleOpenEdit = (address) => {
    if (busy) {
      return;
    }

    setEditorState({
      open: true,

      mode: "edit",

      address,
    });
  };

  const handleCloseEditor = () => {
    if (editorLoading) {
      return;
    }

    setEditorState({
      open: false,

      mode: "create",

      address: null,
    });
  };

  const handleSubmitEditor = async (values) => {
    const isCreate = editorState.mode === "create";

    try {
      if (isCreate) {
        await createManagedAddress(values);
      } else {
        const result = await updateManagedAddress(editorState.address, values);

        if (result?.status === "unchanged") {
          setEditorState({
            open: false,

            mode: "create",

            address: null,
          });

          toast.info({
            message: "Không có thay đổi",

            description: "Đơn vị và địa chỉ vẫn giữ nguyên.",
          });

          return;
        }
      }

      setEditorState({
        open: false,

        mode: "create",

        address: null,
      });

      const refreshed = await refreshAfterMutation();

      if (refreshed) {
        toast.success({
          message: isCreate ? "Đã thêm địa chỉ" : "Đã cập nhật địa chỉ",

          description: isCreate
            ? "Địa chỉ mới đã được tạo thành công."
            : "Thông tin địa chỉ đã được cập nhật.",
        });
      }
    } catch (saveError) {
      toast.error({
        message: isCreate
          ? "Không thể thêm địa chỉ"
          : "Không thể cập nhật địa chỉ",

        description: getErrorDescription(
          saveError,
          "Vui lòng kiểm tra dữ liệu và thử lại.",
        ),
      });
    }
  };

  /* ========================================
     Order info
  ======================================== */

  const handleOpenOrderInfo = (address) => {
    if (busy) {
      return;
    }

    setOrderInfoAddress(address);
  };

  const handleCloseOrderInfo = () => {
    if (isSavingOrderInfo) {
      return;
    }

    setOrderInfoAddress(null);
  };

  const handleSubmitOrderInfo = async (values) => {
    if (!orderInfoAddress) {
      return;
    }

    const newAgency = getAgencyById(values.agencyId);

    const oldAgency =
      orderInfoAddress?.agencyId != null
        ? getAgencyById(orderInfoAddress.agencyId)
        : null;

    try {
      const result = await saveAgencyInfo({
        address: orderInfoAddress,

        oldAgency,

        newAgency,

        orderInfo: {
          orderName: values.orderName,

          orderPhone: values.orderPhone,

          timeReceive: values.timeReceive,

          note: values.note,

          paymentType: values.paymentType,
        },
      });

      setOrderInfoAddress(null);

      const refreshed = await refreshAfterMutation();

      if (refreshed) {
        toast.success({
          message:
            result?.mode === "assign"
              ? "Đã thiết lập thông tin đặt hàng"
              : "Đã cập nhật thông tin đặt hàng",

          description:
            result?.mode === "assign"
              ? "Đại lý và thông tin người nhận đã được gán cho địa chỉ."
              : "Thông tin đặt hàng đã được cập nhật.",
        });
      }
    } catch (saveError) {
      toast.error({
        message: "Không thể lưu thông tin đặt hàng",

        description: getErrorDescription(
          saveError,
          "Vui lòng kiểm tra thông tin và thử lại.",
        ),
      });
    }
  };

  /* ========================================
     POS assignment
  ======================================== */

  const handleOpenPosAssignment = (address) => {
    if (busy) {
      return;
    }

    if (address?.agencyAddressId == null) {
      toast.warning({
        message: "Chưa thể thêm vào trung tâm",

        description:
          "Hãy thiết lập đại lý và thông tin đặt hàng cho địa chỉ trước.",
      });

      return;
    }

    setPosAssignmentAddress(address);
  };

  const handleClosePosAssignment = () => {
    if (isAssigning) {
      return;
    }

    setPosAssignmentAddress(null);
  };

  const handleSubmitPosAssignment = async (values) => {
    if (!posAssignmentAddress) {
      return;
    }

    try {
      await assignAddressToPos(posAssignmentAddress, {
        posId: values.posId,

        shippingFee: values.shippingFee,
      });

      setPosAssignmentAddress(null);

      const refreshed = await refreshAfterMutation();

      if (refreshed) {
        toast.success({
          message: "Đã thêm địa chỉ vào trung tâm",

          description: "Trung tâm và phí giao hàng đã được thiết lập.",
        });
      }
    } catch (assignError) {
      toast.error({
        message: "Không thể thêm vào trung tâm",

        description: getErrorDescription(
          assignError,
          "Vui lòng kiểm tra trung tâm và phí giao hàng rồi thử lại.",
        ),
      });
    }
  };

  /* ========================================
     Deactivate
  ======================================== */

  const handleRequestDeactivate = (address) => {
    if (busy) {
      return;
    }

    setAddressToDeactivate(address);
  };

  const handleCloseDeactivate = () => {
    if (isDeactivating) {
      return;
    }

    setAddressToDeactivate(null);
  };

  const handleConfirmDeactivate = async () => {
    if (!addressToDeactivate) {
      return;
    }

    try {
      await deactivateManagedAddress(addressToDeactivate);

      setAddressToDeactivate(null);

      toast.success({
        message: "Đã vô hiệu hóa địa chỉ",

        description: "Địa chỉ đã được loại khỏi danh sách đang hoạt động.",
      });
    } catch (deactivateError) {
      toast.error({
        message: "Không thể vô hiệu hóa địa chỉ",

        description: getErrorDescription(deactivateError, "Vui lòng thử lại."),
      });
    }
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="address-management-page">
      <ManagementPageHeader
        title="Danh sách địa chỉ"
        description="Quản lý địa chỉ giao hàng, đơn vị và thông tin phân công đại lý."
        actions={
          <div className="address-management-page__header-actions">
            <SearchInput
              size="lg"
              allowClear
              value={searchValue}
              placeholder="Tìm địa chỉ, đơn vị hoặc đại lý..."
              className="address-management-page__search"
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
            />

            <Button
              icon={<ReloadOutlined />}
              disabled={busy}
              className="address-management-page__refresh"
              onClick={handleRefresh}
            >
              Làm mới
            </Button>

            <AppButton
              icon={<PlusOutlined />}
              disabled={busy}
              onClick={handleOpenCreate}
            >
              Thêm địa chỉ
            </AppButton>
          </div>
        }
      />

      <AddressManagementTable
        addresses={filteredAddresses}
        loading={loading}
        error={addressesError}
        resetPageKey={searchValue}
        mutationAddressId={activeMutationAddressId}
        isMutating={busy}
        getAgencyById={getAgencyById}
        emptyDescription={emptyDescription}
        onOrderInfo={handleOpenOrderInfo}
        onAssignPos={handleOpenPosAssignment}
        onEdit={handleOpenEdit}
        onDeactivate={handleRequestDeactivate}
        onRetry={handleRefresh}
      />

      <AddressFormModal
        open={editorState.open}
        mode={editorState.mode}
        address={editorState.address}
        loading={editorLoading}
        onCancel={handleCloseEditor}
        onSubmit={handleSubmitEditor}
      />

      <AddressOrderInfoModal
        open={Boolean(orderInfoAddress)}
        address={orderInfoAddress}
        agencies={agencies}
        loading={isSavingOrderInfo}
        onCancel={handleCloseOrderInfo}
        onSubmit={handleSubmitOrderInfo}
      />

      <AddressPosAssignmentModal
        open={Boolean(posAssignmentAddress)}
        address={posAssignmentAddress}
        kitchens={kitchens}
        kitchensLoading={kitchensLoading}
        kitchensError={kitchensError}
        loading={isAssigning}
        onCancel={handleClosePosAssignment}
        onSubmit={handleSubmitPosAssignment}
      />

      <ConfirmModal
        open={Boolean(addressToDeactivate)}
        title="Vô hiệu hóa địa chỉ?"
        danger
        loading={isDeactivating}
        confirmText="Vô hiệu hóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDeactivate}
        onCancel={handleCloseDeactivate}
      >
        <div className="address-management-page__confirm">
          <p>
            Địa chỉ <strong>{deactivateAddressName}</strong> sẽ không còn xuất
            hiện trong danh sách đang hoạt động.
          </p>

          <p className="address-management-page__confirm-note">
            Thao tác này sử dụng cơ chế vô hiệu hóa của hệ thống, không xóa dữ
            liệu vật lý.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default AddressManagementPage;
