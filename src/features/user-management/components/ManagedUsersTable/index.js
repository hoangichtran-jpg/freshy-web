import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Dropdown } from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import { formatPhoneNumberWithRegion } from "../../../../helpers";

import EmptyState from "../../../../shared/components/EmptyState";

import "./ManagedUsersTable.scss";


const PAGE_SIZE = 10;

/* ========================================
   Helpers
======================================== */

const getFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

const getKitchenNames = (user) => {
  if (Array.isArray(user?.posName)) {
    return user.posName.filter(Boolean);
  }

  if (user?.posName) {
    return [user.posName];
  }

  return [];
};

/* ========================================
   Component
======================================== */

function ManagedUsersTable({
  users,
  loading,
  error,
  deletingPhone,
  showKitchens,
  resetPageKey,
  emptyDescription,
  onEdit,
  onDelete,
  onManageKitchens,
  onRetry,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / PAGE_SIZE)),
    [users.length],
  );

  /*
   * Search thay đổi
   * → quay về page 1.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [resetPageKey]);

  /*
   * Nếu xóa record cuối
   * của page cuối thì clamp
   * về page hợp lệ gần nhất.
   */
  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  /* ========================================
     Columns
  ======================================== */

  const columns = useMemo(() => {
    const result = [
      {
        title: "STT",

        key: "index",

        width: 72,

        align: "center",

        render: (_, __, index) => (
          <span className="managed-users-table__index">
            {(currentPage - 1) * PAGE_SIZE + index + 1}
          </span>
        ),
      },

      {
        title: "Họ tên",

        key: "fullName",

        width: 260,

        sorter: (first, second) =>
          getFullName(first).localeCompare(getFullName(second), "vi"),

        render: (_, record) => {
          const fullName = getFullName(record);

          return (
            <div className="managed-users-table__identity">
              <div className="managed-users-table__avatar">
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </div>

              <div className="managed-users-table__identity-content">
                <span className="managed-users-table__name" title={fullName}>
                  {fullName || "Chưa cập nhật"}
                </span>

                <span className="managed-users-table__meta">
                  {record?.phoneNumber
                    ? "Tài khoản đang quản lý"
                    : "Chưa hoàn thiện thông tin"}
                </span>
              </div>
            </div>
          );
        },
      },
    ];

    /* ========================================
           Kitchen column
        ======================================== */

    if (showKitchens) {
      result.push({
        title: "Bếp được phân công",

        key: "kitchens",

        render: (_, record) => {
          const kitchens = getKitchenNames(record);

          const visibleKitchens = kitchens.slice(0, 2);

          const hiddenCount = Math.max(
            0,
            kitchens.length - visibleKitchens.length,
          );

          return (
            <div className="managed-users-table__kitchen-list">
              {visibleKitchens.length > 0 ? (
                <>
                  {visibleKitchens.map((kitchen, index) => (
                    <span
                      key={`${kitchen}-${index}`}
                      className="managed-users-table__kitchen"
                      title={kitchen}
                    >
                      {kitchen}
                    </span>
                  ))}

                  {hiddenCount > 0 ? (
                    <span className="managed-users-table__more-kitchens">
                      +{hiddenCount}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="managed-users-table__unassigned">
                  <span className="managed-users-table__unassigned-dot" />
                  Chưa phân công
                </span>
              )}
            </div>
          );
        },
      });
    }

    /* ========================================
           Phone
        ======================================== */

    result.push({
      title: "Số điện thoại",

      dataIndex: "phoneNumber",

      key: "phoneNumber",

      width: 190,

      render: (phoneNumber) => (
        <span className="managed-users-table__phone">
          {phoneNumber
            ? formatPhoneNumberWithRegion(phoneNumber) || phoneNumber
            : "Chưa cập nhật"}
        </span>
      ),
    });

    /* ========================================
           Actions
        ======================================== */

    result.push({
      title: "",

      key: "actions",

      width: 72,

      align: "center",

      render: (_, record) => {
        const deleting = deletingPhone === record?.phoneNumber;

        const hasMutation = Boolean(deletingPhone);

        const menuItems = [
          showKitchens && onManageKitchens
            ? {
                key: "kitchens",

                icon: <SettingOutlined />,

                label: "Quản lý bếp",

                disabled: hasMutation,
              }
            : null,

          {
            key: "edit",

            icon: <EditOutlined />,

            label: "Chỉnh sửa",

            disabled: hasMutation,
          },

          {
            type: "divider",
          },

          {
            key: "delete",

            icon: <DeleteOutlined />,

            label: "Xóa người dùng",

            danger: true,

            disabled: hasMutation,
          },
        ].filter(Boolean);

        const handleMenuClick = ({ key, domEvent }) => {
          domEvent?.stopPropagation();

          if (key === "kitchens") {
            onManageKitchens?.(record);

            return;
          }

          if (key === "edit") {
            onEdit(record);

            return;
          }

          if (key === "delete") {
            onDelete(record);
          }
        };

        return (
          <div className="managed-users-table__menu-cell">
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: menuItems,

                onClick: handleMenuClick,
              }}
              overlayClassName="managed-users-table__dropdown"
            >
              <Button
                type="text"
                loading={deleting}
                disabled={hasMutation && !deleting}
                icon={<MoreOutlined />}
                aria-label="Mở menu thao tác"
                className="managed-users-table__more-button"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            </Dropdown>
          </div>
        );
      },
    });

    return result;
  }, [
    currentPage,
    deletingPhone,
    onDelete,
    onEdit,
    onManageKitchens,
    showKitchens,
  ]);

  /* ========================================
     Empty / Error
  ======================================== */

  const emptyContent = error ? (
    <div className="managed-users-table__state">
      <div className="managed-users-table__state-title">
        Không thể tải dữ liệu
      </div>

      <div className="managed-users-table__state-description">
        Đã có lỗi khi tải danh sách người dùng.
      </div>

      {onRetry ? (
        <Button
          icon={<ReloadOutlined />}
          className="managed-users-table__retry"
          onClick={onRetry}
        >
          Thử lại
        </Button>
      ) : null}
    </div>
  ) : (
    <EmptyState
      image="simple"
      description={emptyDescription}
    />
  );

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementTable
      rowKey="phoneNumber"
      className="managed-users-table"
      columns={columns}
      dataSource={users}
      loading={{
        spinning: loading,

        tip: "Đang tải danh sách...",
      }}
      scroll={{
        x: showKitchens ? 980 : 700,
      }}
      locale={{
        emptyText: emptyContent,
      }}
      pagination={{
        current: currentPage,

        pageSize: PAGE_SIZE,

        total: users.length,

        showSizeChanger: false,

        showQuickJumper: false,

        hideOnSinglePage: true,

        showTotal: (total) => `${total} người dùng`,
      }}
      onChange={(pagination) => {
        setCurrentPage(pagination.current || 1);
      }}
    />
  );
}

/* ========================================
   PropTypes
======================================== */

ManagedUsersTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string,

      lastName: PropTypes.string,

      phoneNumber: PropTypes.string,

      posName: PropTypes.oneOfType([
        PropTypes.string,

        PropTypes.arrayOf(PropTypes.string),
      ]),
    }),
  ),

  loading: PropTypes.bool,

  error: PropTypes.any,

  deletingPhone: PropTypes.string,

  showKitchens: PropTypes.bool,

  resetPageKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  emptyDescription: PropTypes.node,

  onEdit: PropTypes.func.isRequired,

  onDelete: PropTypes.func.isRequired,

  onManageKitchens: PropTypes.func,

  onRetry: PropTypes.func,
};

ManagedUsersTable.defaultProps = {
  users: [],

  loading: false,

  error: null,

  deletingPhone: null,

  showKitchens: false,

  resetPageKey: "",

  emptyDescription: "Chưa có dữ liệu.",

  onManageKitchens: null,

  onRetry: null,
};

export default ManagedUsersTable;
