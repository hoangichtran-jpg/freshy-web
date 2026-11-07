import React, { useMemo } from "react";

import PropTypes from "prop-types";

import { Button, Dropdown, Popover, Spin, Switch, Table, Tooltip } from "antd";

import {
  DeleteOutlined,
  InboxOutlined,
  MoreOutlined,
  ReloadOutlined,
  ShopOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import "./KitchenMenuTable.scss";

/* ========================================
   Helpers
======================================== */

const formatPrice = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value).toLocaleString("vi-VN");
};

/* ========================================
   Component
======================================== */

function KitchenMenuTable({
  menus,

  pagination,

  selectedKitchenId,

  /*
   * Full / initial loading.
   */
  loading,

  /*
   * Pagination loading.
   */
  pageLoading,

  error,

  changingMenuId,
  deletingMenuId,

  onPageChange,
  onStatusChange,
  onDelete,
  onRetry,
}) {
  /* ========================================
     Server pagination
  ======================================== */

  const currentPage = Math.max(1, Number(pagination?.current) || 1);

  const pageSize = Math.max(1, Number(pagination?.pageSize) || 10);

  const total = Math.max(0, Number(pagination?.total) || 0);

  /* ========================================
     Columns
  ======================================== */

  const columns = useMemo(
    () => [
      /* ========================================
         STT
      ======================================== */

      {
        title: "STT",

        key: "index",

        width: 72,

        align: "center",

        render: (_, __, index) => (
          <span className="kitchen-menu-table__index">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        ),
      },

      /* ========================================
         Menu name
      ======================================== */

      {
        title: "Tên thực đơn",

        dataIndex: "menuName",

        key: "menuName",

        width: 250,

        sorter: (first, second) =>
          (first.menuName || "").localeCompare(second.menuName || "", "vi"),

        render: (value) => (
          <span className="kitchen-menu-table__name" title={value || ""}>
            {value || "Chưa cập nhật"}
          </span>
        ),
      },

      /* ========================================
         Items
      ======================================== */

      {
        title: "Món ăn",

        dataIndex: "itemNames",

        key: "itemNames",

        width: 640,

        /*
         * Hiện tại sorter này vẫn
         * chỉ sort current server page.
         *
         * Sau này nếu muốn sort toàn bộ
         * dataset thì backend cần hỗ trợ.
         */
        sorter: (first, second) =>
          (first.itemNames?.filter((item) => item.isActive).length || 0) -
          (second.itemNames?.filter((item) => item.isActive).length || 0),

        render: (items = [], record) => {
          const activeItems = Array.isArray(items)
            ? items.filter((item) => item.isActive)
            : [];

          if (activeItems.length === 0) {
            return (
              <span className="kitchen-menu-table__empty-value">
                Chưa có món
              </span>
            );
          }

          const visibleItems = activeItems.slice(0, 3);

          const remainingCount = activeItems.length - visibleItems.length;

          const allItemsContent = (
            <div className="kitchen-menu-items-popover__list">
              {activeItems.map((item, index) => {
                const price = formatPrice(item.taPrice);

                return (
                  <div
                    key={item.itemId}
                    className="kitchen-menu-items-popover__item"
                  >
                    <span className="kitchen-menu-items-popover__index">
                      {index + 1}
                    </span>

                    <span className="kitchen-menu-items-popover__name">
                      {item.name}
                    </span>

                    <span className="kitchen-menu-items-popover__price">
                      {price ? `${price}đ` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          );

          return (
            <div className="kitchen-menu-table__items">
              {visibleItems.map((item) => (
                <Tooltip
                  key={item.itemId}
                  title={
                    item.taPrice != null
                      ? `${item.name} · ${formatPrice(item.taPrice)}đ`
                      : item.name
                  }
                >
                  <span className="kitchen-menu-table__item">{item.name}</span>
                </Tooltip>
              ))}

              {remainingCount > 0 && (
                <Popover
                  trigger={["click"]}
                  placement="bottomLeft"
                  overlayClassName="kitchen-menu-items-popover"
                  title={
                    <div className="kitchen-menu-items-popover__title">
                      <strong>{record.menuName}</strong>

                      <span>{activeItems.length} món</span>
                    </div>
                  }
                  content={allItemsContent}
                >
                  <button
                    type="button"
                    className="kitchen-menu-table__more-items"
                  >
                    +{remainingCount} món
                  </button>
                </Popover>
              )}
            </div>
          );
        },
      },

      /* ========================================
         Status
      ======================================== */

      {
        title: "Trạng thái",

        dataIndex: "isActive",

        key: "isActive",

        width: 180,

        /*
         * Filter này hiện tại
         * vẫn là client-side,
         * tức chỉ filter current page.
         */
        filters: [
          {
            text: "Đang hoạt động",

            value: true,
          },
          {
            text: "Tạm tắt",

            value: false,
          },
        ],

        onFilter: (value, record) => record.isActive === value,

        render: (value, record) => {
          const menuId = record.managerMenuPosDayId;

          const isChanging = changingMenuId === menuId;

          const isDeleting = deletingMenuId === menuId;

          return (
            <div className="kitchen-menu-table__status">
              <Switch
                size="small"
                checked={value}
                loading={isChanging}
                disabled={isDeleting}
                onChange={(checked) => onStatusChange(record, checked)}
              />

              <span
                className={[
                  "kitchen-menu-table__status-text",

                  value ? "kitchen-menu-table__status-text--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {value ? "Đang hoạt động" : "Tạm tắt"}
              </span>
            </div>
          );
        },
      },

      /* ========================================
         Actions
      ======================================== */

      {
        title: "",

        key: "actions",

        width: 68,

        align: "right",

        fixed: "right",

        render: (_, record) => {
          const menuId = record.managerMenuPosDayId;

          const isChanging = changingMenuId === menuId;

          const isDeleting = deletingMenuId === menuId;

          return (
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              disabled={isChanging || isDeleting}
              overlayClassName="kitchen-menu-table__dropdown"
              menu={{
                items: [
                  {
                    key: "delete",

                    label: "Xóa thực đơn",

                    icon: <DeleteOutlined />,

                    danger: true,
                  },
                ],

                onClick: ({ key, domEvent }) => {
                  domEvent?.stopPropagation();

                  if (key === "delete") {
                    onDelete(record);
                  }
                },
              }}
            >
              <Button
                type="text"
                aria-label="Thêm thao tác"
                icon={<MoreOutlined />}
                loading={isDeleting}
                className="kitchen-menu-table__action-button"
                onClick={(event) => event.stopPropagation()}
              />
            </Dropdown>
          );
        },
      },
    ],
    [
      changingMenuId,
      currentPage,
      deletingMenuId,
      onDelete,
      onStatusChange,
      pageSize,
    ],
  );

  /* ========================================
     Initial loading
  ======================================== */

  /*
   * Chỉ dùng cho:
   *
   * - lần đầu vào màn hình
   * - đổi kitchen
   * - retry full table
   *
   * KHÔNG chạy khi đổi pagination.
   */
  if (loading) {
    return (
      <div className="kitchen-menu-table">
        <div className="kitchen-menu-table__state">
          <Spin size="large" />

          <span>Đang tải thực đơn...</span>
        </div>
      </div>
    );
  }

  /* ========================================
     Initial error
  ======================================== */

  if (error) {
    return (
      <div className="kitchen-menu-table">
        <div className="kitchen-menu-table__state">
          <div className="kitchen-menu-table__state-icon kitchen-menu-table__state-icon--error">
            <WarningOutlined />
          </div>

          <strong>Không thể tải thực đơn</strong>

          <span>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</span>

          <Button
            icon={<ReloadOutlined />}
            className="kitchen-menu-table__retry"
            onClick={onRetry}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  /* ========================================
     Empty state
  ======================================== */

  const emptyContent = selectedKitchenId
    ? {
        icon: <InboxOutlined />,

        title: "Chưa có thực đơn",

        description: "Trung tâm này chưa có thực đơn để hiển thị.",
      }
    : {
        icon: <ShopOutlined />,

        title: "Chọn trung tâm",

        description: "Chọn một trung tâm để xem thực đơn đang áp dụng.",
      };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="kitchen-menu-table">
      <Table
        rowKey="managerMenuPosDayId"
        columns={columns}
        dataSource={menus}
        tableLayout="fixed"
        /*
         * QUAN TRỌNG:
         *
         * Đây là loading của Ant Table,
         * không phải return full-screen
         * loading phía trên.
         *
         * Vì vậy:
         *
         * page 1 rows vẫn còn
         * khi request page 2 chạy.
         */
        loading={pageLoading}
        scroll={{
          x: 1210,

          /*
           * Body table dùng
           * available height.
           */
          y: "100%",

          scrollToFirstRowOnChange: true,
        }}
        pagination={{
          /*
           * Controlled pagination.
           *
           * Source of truth nằm
           * trong useKitchenMenus.
           */
          current: currentPage,

          pageSize,

          /*
           * Đây là tổng record
           * từ backend.
           *
           * KHÔNG phải:
           *
           * menus.length
           */
          total,

          showSizeChanger: false,

          hideOnSinglePage: true,

          position: ["bottomRight"],

          showTotal: (recordTotal, range) =>
            `${range[0]}–${range[1]} / ${recordTotal} thực đơn`,

          onChange: (page, nextPageSize) => {
            /*
             * Không set local page.
             *
             * Hook chịu trách nhiệm:
             *
             * request backend
             * ↓
             * response thành công
             * ↓
             * pagination.current update
             */
            onPageChange(page, nextPageSize);
          },
        }}
        onChange={(_pagination, _filters, _sorter, extra) => {
          /*
           * Filter status hiện tại
           * vẫn chạy client-side trên
           * current server page.
           *
           * Nếu đang page > 1
           * rồi filter, về page 1
           * để tránh UX khó hiểu.
           */
          if (extra.action === "filter" && currentPage !== 1) {
            onPageChange(1, pageSize);
          }
        }}
        locale={{
          emptyText: (
            <div className="kitchen-menu-table__empty">
              <div className="kitchen-menu-table__empty-icon">
                {emptyContent.icon}
              </div>

              <strong>{emptyContent.title}</strong>

              <span>{emptyContent.description}</span>
            </div>
          ),
        }}
      />
    </div>
  );
}

/* ========================================
   Prop types
======================================== */

KitchenMenuTable.propTypes = {
  menus: PropTypes.array,

  pagination: PropTypes.shape({
    current: PropTypes.number,

    pageSize: PropTypes.number,

    total: PropTypes.number,

    totalPages: PropTypes.number,
  }),

  selectedKitchenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /*
   * Initial / full loading.
   */
  loading: PropTypes.bool,

  /*
   * Pagination loading.
   */
  pageLoading: PropTypes.bool,

  error: PropTypes.any,

  changingMenuId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  deletingMenuId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  onPageChange: PropTypes.func.isRequired,

  onStatusChange: PropTypes.func.isRequired,

  onDelete: PropTypes.func.isRequired,

  onRetry: PropTypes.func.isRequired,
};

KitchenMenuTable.defaultProps = {
  menus: [],

  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },

  selectedKitchenId: null,

  loading: false,

  pageLoading: false,

  error: null,

  changingMenuId: null,

  deletingMenuId: null,
};

export default KitchenMenuTable;
