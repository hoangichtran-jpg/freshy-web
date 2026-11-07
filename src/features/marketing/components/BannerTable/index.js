import React, { useMemo } from "react";

import PropTypes from "prop-types";

import { Button, Dropdown, Switch, Tooltip } from "antd";

import {
  DeleteOutlined,
  MoreOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import EmptyState from "../../../../shared/components/EmptyState";

import "./BannerTable.scss";


/* ========================================
   Helpers
======================================== */

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("vi-VN");
};

const getTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

/* ========================================
   Component
======================================== */

function BannerTable({
  banners,
  loading,

  processingBannerId,
  processingAction,

  onPreview,
  onToggleVisibility,
  onDelete,
}) {
  const columns = useMemo(
    () => [
      /* ========================================
           Banner
        ======================================== */

      {
        title: "Banner",

        dataIndex: "imageUrl",

        key: "image",

        width: 94,

        render: (imageUrl, record) => (
          <div className="banner-table__thumbnail">
            {imageUrl ? (
              <img src={imageUrl} alt={record.title || "Banner quảng cáo"} />
            ) : (
              <div className="banner-table__thumbnail-empty">
                <PictureOutlined />
              </div>
            )}
          </div>
        ),
      },

      /* ========================================
           Title

           Search chính nằm ở toolbar.

           Column này chỉ thêm sorter
           A-Z / Z-A.
        ======================================== */

      {
        title: "Tiêu đề",

        dataIndex: "title",

        key: "title",

        sorter: (first, second) =>
          normalizeText(first.title).localeCompare(
            normalizeText(second.title),
            "vi",
          ),

        render: (title) => (
          <strong className="banner-table__title">
            {title || "Chưa có tiêu đề"}
          </strong>
        ),
      },

      /* ========================================
           Status

           Filter nằm trực tiếp trong column.
        ======================================== */

      {
        title: "Trạng thái",

        dataIndex: "active",

        key: "active",

        width: 140,

        align: "center",

        filters: [
          {
            text: "Đang hiển thị",

            value: "active",
          },

          {
            text: "Đang ẩn",

            value: "inactive",
          },
        ],

        filterMultiple: false,

        onFilter: (value, record) => {
          if (value === "active") {
            return Boolean(record.active);
          }

          if (value === "inactive") {
            return !Boolean(record.active);
          }

          return true;
        },

        render: (active, record) => {
          const rowToggling =
            processingBannerId === record.id && processingAction === "toggle";

          const anotherRowProcessing =
            processingBannerId !== null &&
            processingBannerId !== undefined &&
            processingBannerId !== record.id;

          return (
            <div
              className="banner-table__status"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <Tooltip
                title={
                  active
                    ? "Đang hiển thị — bấm để ẩn"
                    : "Đang ẩn — bấm để hiển thị"
                }
              >
                <Switch
                  checked={Boolean(active)}
                  loading={rowToggling}
                  disabled={anotherRowProcessing}
                  className="banner-table__status-switch"
                  aria-label={active ? "Ẩn quảng cáo" : "Hiển thị quảng cáo"}
                  onChange={() => {
                    onToggleVisibility(record);
                  }}
                />
              </Tooltip>
            </div>
          );
        },
      },

      /* ========================================
           Created date
        ======================================== */

      {
        title: "Ngày tạo",

        dataIndex: "createdDate",

        key: "createdDate",

        width: 140,

        sorter: (first, second) =>
          getTimestamp(first.createdDate) - getTimestamp(second.createdDate),

        defaultSortOrder: "descend",

        render: (value) => (
          <span className="banner-table__date">{formatDate(value)}</span>
        ),
      },

      /* ========================================
           Actions
        ======================================== */

      {
        title: "",

        key: "actions",

        width: 64,

        align: "center",

        render: (_, record) => {
          const rowDeleting =
            processingBannerId === record.id && processingAction === "delete";

          const isProcessing =
            processingBannerId !== null && processingBannerId !== undefined;

          const menuItems = [
            {
              key: "delete",

              icon: <DeleteOutlined />,

              label: "Xóa quảng cáo",

              danger: true,

              disabled: isProcessing,
            },
          ];

          const handleMenuClick = ({ key, domEvent }) => {
            domEvent?.stopPropagation();

            if (key === "delete") {
              onDelete(record);
            }
          };

          return (
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: menuItems,

                onClick: handleMenuClick,
              }}
              overlayClassName="banner-table__dropdown"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                loading={rowDeleting}
                disabled={isProcessing && !rowDeleting}
                aria-label="Mở menu thao tác"
                className="banner-table__more-button"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            </Dropdown>
          );
        },
      },
    ],
    [onDelete, onToggleVisibility, processingAction, processingBannerId],
  );

  return (
    <ManagementTable
      rowKey="id"
      className="banner-table"
      columns={columns}
      dataSource={banners}
      loading={{
        spinning: loading,

        tip: "Đang tải danh sách quảng cáo...",
      }}
      scroll={{
        x: 760,
      }}
      pagination={{
        pageSize: 8,

        showSizeChanger: false,

        hideOnSinglePage: true,

        showTotal: (total) => `${total} quảng cáo`,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description="Chưa có quảng cáo nào"
          />
        ),
      }}
      onRow={(record) => ({
        onClick: () => {
          onPreview(record);
        },

        className: "banner-table__row",
      })}
    />
  );
}

/* ========================================
   PropTypes
======================================== */

BannerTable.propTypes = {
  banners: PropTypes.arrayOf(PropTypes.object),

  loading: PropTypes.bool,

  processingBannerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  processingAction: PropTypes.oneOf(["toggle", "delete"]),

  onPreview: PropTypes.func.isRequired,

  onToggleVisibility: PropTypes.func.isRequired,

  onDelete: PropTypes.func.isRequired,
};

BannerTable.defaultProps = {
  banners: [],

  loading: false,

  processingBannerId: null,

  processingAction: null,
};

export default BannerTable;
