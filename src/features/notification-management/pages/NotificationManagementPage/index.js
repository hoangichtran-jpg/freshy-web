import React, { useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";

import {
  useAuth,
} from "../../../../shared/auth";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import {
  NotificationCreateModal,
  NotificationDetailModal,
  NotificationHistoryTable,
  NotificationHistoryToolbar,
} from "../../components";

import { getNotificationAudienceLabel } from "../../constants";

import { useNotificationHistory, useNotificationManagement } from "../../hooks";

import "./NotificationManagementPage.scss";

/* ========================================
   Helpers
======================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi");

/* ========================================
   Page
======================================== */

function NotificationManagementPage() {
  /* ========================================
     Auth
  ======================================== */

  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone || "";

  /* ========================================
     Send mutation
  ======================================== */

  const {
    sending,

    sendNow,
  } = useNotificationManagement(managerPhone);

  /* ========================================
     Local history
  ======================================== */

  const {
    history,

    appendHistory,

    removeHistoryItem,
  } = useNotificationHistory(managerPhone);

  /* ========================================
     Presentation state
  ======================================== */

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ========================================
     Search
  ======================================== */

  const filteredHistory = useMemo(() => {
    const keyword = normalizeText(searchText);

    if (!keyword) {
      return history;
    }

    return history.filter((item) => {
      const audienceLabel = getNotificationAudienceLabel(item.audience);

      return [item.title, item.body, audienceLabel]
        .map(normalizeText)
        .some((value) => value.includes(keyword));
    });
  }, [history, searchText]);

  /* ========================================
     Shared send operation

     API
       ↓ success
     local history

     Nếu API fail:
     không ghi history.

     Nếu API success nhưng localStorage fail:
     việc gửi vẫn được xem là thành công.
  ======================================== */

  const executeSend = async (values) => {
    const result = await sendNow(values);

    if (result?.skipped) {
      return {
        ok: false,

        skipped: true,
      };
    }

    if (!result?.ok) {
      toast.error({
        title: "Không thể gửi thông báo",

        description: getErrorDescription(
          result?.error,
          "Vui lòng kiểm tra nội dung và thử lại.",
        ),
      });

      return {
        ok: false,

        skipped: false,
      };
    }

    const historyResult = appendHistory(result.payload);

    return {
      ok: true,

      skipped: false,

      payload: result.payload,

      historySaved: historyResult.ok,
    };
  };

  /* ========================================
     Create
  ======================================== */

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (sending) {
      return;
    }

    setIsCreateOpen(false);
  };

  const handleSendNotification = async (values) => {
    const result = await executeSend(values);

    if (!result.ok) {
      return;
    }

    const audienceLabel = getNotificationAudienceLabel(
      result.payload?.audience,
    );

    setIsCreateOpen(false);

    if (!result.historySaved) {
      toast.warning({
        title: "Đã gửi thông báo",

        description: `Thông báo đã được gửi tới ${audienceLabel.toLocaleLowerCase(
          "vi",
        )}, nhưng không thể lưu lịch sử trên trình duyệt này.`,
      });

      return;
    }

    toast.success({
      title: "Gửi thông báo thành công",

      description: `Thông báo đã được gửi tới ${audienceLabel.toLocaleLowerCase(
        "vi",
      )}.`,
    });
  };

  /* ========================================
     Detail
  ======================================== */

  const handleOpenNotification = (notification) => {
    setSelectedNotification(notification);
  };

  const handleCloseNotification = () => {
    if (sending) {
      return;
    }

    setSelectedNotification(null);
  };

  /* ========================================
     Resend

     Resend = một send event mới.

     Vì vậy API success sẽ tạo history record
     mới với sentAt mới.

     Không sửa record cũ.
  ======================================== */

  const handleResendNotification = async (notification) => {
    const result = await executeSend({
      audience: notification.audience,

      title: notification.title,

      body: notification.body,
    });

    if (!result.ok) {
      return;
    }

    const audienceLabel = getNotificationAudienceLabel(notification.audience);

    if (!result.historySaved) {
      toast.warning({
        title: "Đã gửi lại thông báo",

        description: `Thông báo đã được gửi lại tới ${audienceLabel.toLocaleLowerCase(
          "vi",
        )}, nhưng không thể lưu lần gửi mới vào lịch sử trình duyệt.`,
      });

      return;
    }

    toast.success({
      title: "Gửi lại thành công",

      description: `Một lần gửi mới tới ${audienceLabel.toLocaleLowerCase(
        "vi",
      )} đã được tạo.`,
    });
  };

  /* ========================================
     Delete request
  ======================================== */

  const handleRequestDelete = (notification) => {
    if (sending) {
      return;
    }

    setDeleteTarget(notification);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  /* ========================================
     Delete local history only
  ======================================== */

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    const result = removeHistoryItem(deleteTarget.clientId);

    if (!result.ok) {
      toast.error({
        title: "Không thể xóa lịch sử",

        description: "Không thể cập nhật dữ liệu trên trình duyệt này.",
      });

      return;
    }

    /*
     * Nếu đang xem chính record vừa xóa
     * thì đóng detail.
     */
    if (selectedNotification?.clientId === deleteTarget.clientId) {
      setSelectedNotification(null);
    }

    setDeleteTarget(null);

    toast.info({
      title: "Đã xóa khỏi lịch sử",

      description:
        "Chỉ bản ghi trên trình duyệt này được xóa. Thông báo đã gửi không bị thu hồi.",
    });
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="notification-management-page">
      {/* ========================================
          Header
      ======================================== */}

      <ManagementPageHeader
        title="Hỗ trợ khách hàng"
        description="Soạn và gửi thông báo tới các nhóm người dùng trong hệ thống."
        actions={
          <AppButton
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Tạo thông báo
          </AppButton>
        }
      />

      {/* ========================================
          History
      ======================================== */}

      <section className="notification-management-page__content">
        <NotificationHistoryToolbar
          searchValue={searchText}
          onSearchChange={setSearchText}
        />

        <NotificationHistoryTable
          notifications={filteredHistory}
          hasSearch={Boolean(searchText.trim())}
          resetPageKey={searchText}
          onNotificationClick={handleOpenNotification}
        />
      </section>

      {/* ========================================
          Create
      ======================================== */}

      <NotificationCreateModal
        open={isCreateOpen}
        submitting={sending}
        onCancel={handleCloseCreate}
        onSubmit={handleSendNotification}
      />

      {/* ========================================
          Detail
      ======================================== */}

      <NotificationDetailModal
        open={Boolean(selectedNotification)}
        notification={selectedNotification}
        resending={sending}
        onClose={handleCloseNotification}
        onResend={handleResendNotification}
        onDelete={handleRequestDelete}
      />

      {/* ========================================
          Delete confirmation
      ======================================== */}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xóa khỏi lịch sử?"
        description="Bản ghi chỉ bị xóa khỏi lịch sử trên trình duyệt này. Thông báo đã gửi tới người nhận sẽ không bị thu hồi."
        confirmText="Xóa khỏi lịch sử"
        cancelText="Hủy"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default NotificationManagementPage;
