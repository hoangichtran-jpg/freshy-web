import React, {
  useMemo,
  useState,
} from "react";

import PropTypes from "prop-types";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import { RegistrationRequestsTable } from "../../components";

import { useRegistrationRequests } from "../../hooks";

import { REGISTRATION_TYPES } from "../../constants/registrationTypes";

import SearchInput from "../../../../shared/components/SearchInput";

import "./RegistrationRequestsPage.scss";

function RegistrationRequestsPage({
  type,
}) {
  const {
    config,

    total,

    filteredRequests,

    searchValue,

    processingId,

    processingAction,

    isProcessing,

    setSearchValue,

    approveRequest,

    rejectRequest,
  } =
    useRegistrationRequests(
      type,
    );


  const [
    confirmation,
    setConfirmation,
  ] = useState(null);


  const selectedRequest =
    confirmation?.request ||
    null;


  const selectedAction =
    confirmation?.action ||
    null;


  const hasSearch =
    Boolean(
      searchValue.trim(),
    );


  const emptyDescription =
    hasSearch
      ? "Không tìm thấy yêu cầu phù hợp."
      : "Chưa có yêu cầu đăng ký đang chờ xử lý.";


  const confirmationContent =
    useMemo(
      () => {
        if (
          !selectedRequest ||
          !config
        ) {
          return null;
        }


        if (
          selectedAction ===
          "approve"
        ) {
          return {
            title:
              "Xác nhận phê duyệt",

            description: (
              <>
                Bạn có chắc chắn muốn phê duyệt{" "}
                <strong>
                  {
                    selectedRequest.name
                  }
                </strong>{" "}
                trở thành{" "}
                {
                  config.subjectLabel
                }
                ?
              </>
            ),

            confirmText:
              "Phê duyệt",

            danger:
              false,
          };
        }


        return {
          title:
            "Xác nhận từ chối",

          description: (
            <>
              Bạn có chắc chắn muốn từ chối yêu cầu của{" "}
              <strong>
                {
                  selectedRequest.name
                }
              </strong>
              ?
            </>
          ),

          confirmText:
            "Từ chối",

          danger:
            true,
        };
      },
      [
        selectedAction,
        selectedRequest,
        config,
      ],
    );


  /* ========================================
     Confirmation
  ======================================== */

  const openApproveConfirmation =
    (
      request,
    ) => {
      if (
        isProcessing
      ) {
        return;
      }


      setConfirmation({
        action:
          "approve",

        request,
      });
    };


  const openRejectConfirmation =
    (
      request,
    ) => {
      if (
        isProcessing
      ) {
        return;
      }


      setConfirmation({
        action:
          "reject",

        request,
      });
    };


  const closeConfirmation =
    () => {
      if (
        isProcessing
      ) {
        return;
      }


      setConfirmation(
        null,
      );
    };


  /* ========================================
     Confirm action
  ======================================== */

  const handleConfirm =
    async () => {
      if (
        !confirmation ||
        !selectedRequest
      ) {
        return;
      }


      try {
        if (
          selectedAction ===
          "approve"
        ) {
          await approveRequest(
            selectedRequest,
          );


          setConfirmation(
            null,
          );


          toast.success({
            message:
              config
                ?.approveSuccessMessage ||
              "Phê duyệt thành công",
          });


          return;
        }


        await rejectRequest(
          selectedRequest,
        );


        setConfirmation(
          null,
        );


        toast.success({
          message:
            config
              ?.rejectSuccessMessage ||
            "Đã từ chối yêu cầu",
        });
      } catch (error) {
        toast.error({
          message:
            selectedAction ===
            "approve"
              ? "Không thể phê duyệt yêu cầu"
              : "Không thể từ chối yêu cầu",

          description:
            getErrorDescription(
              error,
              "Vui lòng thử lại.",
            ),
        });
      }
    };


  if (!config) {
    return null;
  }


  return (
    <div className="registration-requests-page">
      <ManagementPageHeader
        title={
          config.title
        }
        description={`${config.description} Hiện có ${total} yêu cầu đang chờ xử lý.`}
        actions={
          <SearchInput
            size="lg"
            allowClear
            value={
              searchValue
            }
            placeholder="Tìm theo tên, số điện thoại hoặc địa chỉ..."
            className="registration-requests-page__search"
            onChange={(
              event,
            ) =>
              setSearchValue(
                event.target
                  .value,
              )
            }
          />
        }
      />


      <RegistrationRequestsTable
        requests={
          filteredRequests
        }
        processingId={
          processingId
        }
        processingAction={
          processingAction
        }
        isProcessing={
          isProcessing
        }
        emptyDescription={
          emptyDescription
        }
        resetPageKey={
          searchValue
        }
        onApprove={
          openApproveConfirmation
        }
        onReject={
          openRejectConfirmation
        }
      />


      <ConfirmModal
        open={
          Boolean(
            confirmation,
          )
        }
        title={
          confirmationContent
            ?.title
        }
        description={
          confirmationContent
            ?.description
        }
        confirmText={
          confirmationContent
            ?.confirmText
        }
        cancelText="Hủy"
        danger={
          Boolean(
            confirmationContent
              ?.danger,
          )
        }
        loading={
          isProcessing
        }
        onConfirm={
          handleConfirm
        }
        onCancel={
          closeConfirmation
        }
      />
    </div>
  );
}


RegistrationRequestsPage.propTypes = {
  type:
    PropTypes.oneOf([
      REGISTRATION_TYPES.AGENCY,
      REGISTRATION_TYPES.SHIPPER,
    ]).isRequired,
};


export default RegistrationRequestsPage;
