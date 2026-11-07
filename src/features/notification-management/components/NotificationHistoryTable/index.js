import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";


import ManagementTable from "../../../../shared/components/ManagementTable";

import {
  getNotificationAudienceLabel,
  NOTIFICATION_AUDIENCE_OPTIONS,
} from "../../constants";

import { formatNotificationSentAt } from "../../utils";

import EmptyState from "../../../../shared/components/EmptyState";

import "./NotificationHistoryTable.scss";


/* ========================================
   Constants
======================================== */

const PAGE_SIZE = 10;

/* ========================================
   Helpers
======================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi");

/* ========================================
   Component
======================================== */

function NotificationHistoryTable({
  notifications,

  hasSearch,

  resetPageKey,

  onNotificationClick,
}) {
  /* ========================================
     Pagination
  ======================================== */

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () =>
      Math.max(
        1,

        Math.ceil(notifications.length / PAGE_SIZE),
      ),
    [notifications.length],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [resetPageKey]);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  /* ========================================
     Columns
  ======================================== */

  const columns = useMemo(
    () => [
      {
        title: "Tiêu đề",

        dataIndex: "title",

        key: "title",

        width: 250,

        sorter: (first, second) =>
          normalizeText(first?.title).localeCompare(
            normalizeText(second?.title),
            "vi",
          ),

        render: (title) => (
          <span className="notification-history-table__title" title={title}>
            {title}
          </span>
        ),
      },

      {
        title: "Người nhận",

        dataIndex: "audience",

        key: "audience",

        width: 190,

        filters: NOTIFICATION_AUDIENCE_OPTIONS.map((option) => ({
          text: option.label,

          value: option.value,
        })),

        filterSearch: true,

        filterMultiple: true,

        onFilter: (value, record) => record.audience === String(value),

        render: (audience) => (
          <span className="notification-history-table__audience">
            {getNotificationAudienceLabel(audience)}
          </span>
        ),
      },

      {
        title: "Nội dung",

        dataIndex: "body",

        key: "body",

        render: (body) => (
          <span className="notification-history-table__body" title={body}>
            {body}
          </span>
        ),
      },

      {
        title: "Đã gửi lúc",

        dataIndex: "sentAt",

        key: "sentAt",

        width: 190,

        defaultSortOrder: "descend",

        sorter: (first, second) =>
          Date.parse(first.sentAt) - Date.parse(second.sentAt),

        render: (sentAt) => (
          <span
            className="notification-history-table__time"
            title="Thời gian theo thiết bị đang sử dụng"
          >
            {formatNotificationSentAt(sentAt)}
          </span>
        ),
      },
    ],
    [],
  );

  /* ========================================
     Table change
  ======================================== */

  const handleTableChange = (pagination, _filters, _sorter, extra) => {
    if (extra?.action === "filter") {
      setCurrentPage(1);

      return;
    }

    if (pagination?.current) {
      setCurrentPage(pagination.current);
    }
  };

  /* ========================================
     Row interaction
  ======================================== */

  const getRowProps = (notification) => {
    if (typeof onNotificationClick !== "function") {
      return {};
    }

    return {
      className: "notification-history-table__row",

      tabIndex: 0,

      role: "button",

      "aria-label": `Xem chi tiết thông báo ${notification.title}`,

      onClick: () => {
        onNotificationClick(notification);
      },

      onKeyDown: (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();

        onNotificationClick(notification);
      },
    };
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementTable
      rowKey="clientId"
      className="notification-history-table"
      columns={columns}
      dataSource={notifications}
      scroll={{
        x: 920,
      }}
      pagination={{
        current: currentPage,

        pageSize: PAGE_SIZE,

        showSizeChanger: false,

        hideOnSinglePage: true,

        showTotal: (total) => `${total} thông báo`,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description={
              hasSearch
                ? "Không có thông báo phù hợp"
                : "Chưa có lịch sử gửi trên trình duyệt này"
            }
          />
        ),
      }}
      onChange={handleTableChange}
      onRow={getRowProps}
    />
  );
}

NotificationHistoryTable.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      clientId: PropTypes.string.isRequired,

      audience: PropTypes.string.isRequired,

      title: PropTypes.string.isRequired,

      body: PropTypes.string.isRequired,

      sentAt: PropTypes.string.isRequired,
    }),
  ),

  hasSearch: PropTypes.bool,

  resetPageKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  onNotificationClick: PropTypes.func,
};

NotificationHistoryTable.defaultProps = {
  notifications: [],

  hasSearch: false,

  resetPageKey: "",

  onNotificationClick: undefined,
};

export default NotificationHistoryTable;
