import React from "react";
import PropTypes from "prop-types";

import {
  Button,
  Dropdown,
  Popover,
  Switch,
} from "antd";

import {
  EditOutlined,
  MoreOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import EmptyState from "../../../../shared/components/EmptyState";

import "./MenuManagementTable.scss";



const sortMenuItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .slice()
    .sort(
      (first, second) =>
        Number(
          first?.ordinalNumber ??
            0,
        ) -
        Number(
          second?.ordinalNumber ??
            0,
        ),
    );
};


function MenuItems({
  items,
}) {
  const sorted =
    sortMenuItems(items);


  if (
    sorted.length === 0
  ) {
    return (
      <span className="menu-management-table__empty-value">
        Chưa có món
      </span>
    );
  }


  const preview =
    sorted.slice(0, 3);

  const remaining =
    sorted.slice(3);


  return (
    <div className="menu-management-table__items">
      {preview.map(
        (
          item,
          index,
        ) => (
          <span
            key={
              item?.itemId ??
              item?.id ??
              index
            }
            className="menu-management-table__item"
            title={
              item?.name
            }
          >
            {item?.name ||
              "Món ăn"}
          </span>
        ),
      )}


      {remaining.length >
      0 ? (
        <Popover
          trigger="click"
          placement="bottom"
          title="Các món trong thực đơn"
          content={
            <div className="menu-management-table__popover">
              {sorted.map(
                (
                  item,
                  index,
                ) => (
                  <div
                    key={
                      item?.itemId ??
                      item?.id ??
                      index
                    }
                    className="menu-management-table__popover-item"
                  >
                    <span className="menu-management-table__popover-index">
                      {index + 1}
                    </span>

                    <span>
                      {item?.name ||
                        "Món ăn"}
                    </span>
                  </div>
                ),
              )}
            </div>
          }
        >
          <button
            type="button"
            className="menu-management-table__more"
          >
            +{remaining.length} món
          </button>
        </Popover>
      ) : null}
    </div>
  );
}


function MenuManagementTable({
  menus,
  loading,
  pagination,
  changingStatusMenuId,
  assigningMenuId,
  onPageChange,
  onStatusChange,
  onEdit,
  onAssign,
}) {
  const columns = [
    {
      title: "STT",

      key: "index",

      width: 64,

      align: "center",

      render: (
        _,
        __,
        index,
      ) => (
        <span className="menu-management-table__index">
          {(pagination.current -
            1) *
            pagination.pageSize +
            index +
            1}
        </span>
      ),
    },

    {
      title:
        "Tên thực đơn",

      dataIndex:
        "menuName",

      key:
        "menuName",

      width: 230,

      render: (
        value,
      ) => (
        <span className="menu-management-table__name">
          {value ||
            "Chưa đặt tên"}
        </span>
      ),
    },

    {
      title:
        "Món ăn",

      dataIndex:
        "items",

      key:
        "items",

      render: (
        items,
      ) => (
        <MenuItems
          items={items}
        />
      ),
    },

    {
      title:
        "Trạng thái",

      dataIndex:
        "isActive",

      key:
        "isActive",

      width: 180,

      render: (
        isActive,
        record,
      ) => (
        <div className="menu-management-table__status">
          <Switch
            size="small"
            checked={
              Boolean(
                isActive,
              )
            }
            loading={
              changingStatusMenuId ===
              record.menuId
            }
            aria-label={
              isActive
                ? "Tắt thực đơn"
                : "Bật thực đơn"
            }
            onChange={(
              checked,
            ) =>
              onStatusChange(
                record,
                checked,
              )
            }
          />

          <span
            className={[
              "menu-management-table__status-text",

              isActive
                ? "menu-management-table__status-text--active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isActive
              ? "Đang hoạt động"
              : "Đang tắt"}
          </span>
        </div>
      ),
    },

    {
      title: "",

      key:
        "actions",

      width: 56,

      fixed:
        "right",

      align:
        "center",

      render: (
        _,
        record,
      ) => (
        <Dropdown
          trigger={[
            "click",
          ]}
          placement="bottomRight"
          menu={{
            items: [
              {
                key:
                  "assign",

                icon:
                  <PlusCircleOutlined />,

                label:
                  "Thêm vào trung tâm",

                disabled:
                  !record.isActive,

                onClick:
                  () =>
                    onAssign(
                      record,
                    ),
              },

              {
                type:
                  "divider",
              },

              {
                key:
                  "edit",

                icon:
                  <EditOutlined />,

                label:
                  "Chỉnh sửa thực đơn",

                onClick:
                  () =>
                    onEdit(
                      record,
                    ),
              },
            ],
          }}
        >
          <Button
            type="text"
            loading={
              assigningMenuId ===
              record.menuId
            }
            icon={
              <MoreOutlined />
            }
            className="menu-management-table__action"
            aria-label="Mở thao tác"
          />
        </Dropdown>
      ),
    },
  ];


  const showPagination =
    pagination.total >
    pagination.pageSize;


  return (
    <ManagementTable
      className="menu-management-table"
      rowKey="menuId"
      columns={columns}
      dataSource={menus}
      loading={loading}
      pagination={
        showPagination
          ? {
              current:
                pagination.current,

              pageSize:
                pagination.pageSize,

              total:
                pagination.total,

              showSizeChanger:
                false,

              showTotal:
                (total) =>
                  `${total.toLocaleString(
                    "vi-VN",
                  )} thực đơn`,
            }
          : false
      }
      scroll={{
        x: 1000,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description="Chưa có thực đơn"
          />
        ),
      }}
      onChange={(
        nextPagination,
      ) => {
        onPageChange(
          nextPagination.current ??
            1,

          pagination.pageSize,
        );
      }}
    />
  );
}


MenuItems.propTypes = {
  items:
    PropTypes.arrayOf(
      PropTypes.object,
    ),
};


MenuItems.defaultProps = {
  items: [],
};


MenuManagementTable.propTypes = {
  menus:
    PropTypes.arrayOf(
      PropTypes.object,
    ),

  loading:
    PropTypes.bool,

  pagination:
    PropTypes.shape({
      current:
        PropTypes.number.isRequired,

      pageSize:
        PropTypes.number.isRequired,

      total:
        PropTypes.number.isRequired,
    }).isRequired,

  changingStatusMenuId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  assigningMenuId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  onPageChange:
    PropTypes.func.isRequired,

  onStatusChange:
    PropTypes.func.isRequired,

  onEdit:
    PropTypes.func.isRequired,

  onAssign:
    PropTypes.func.isRequired,
};


MenuManagementTable.defaultProps = {
  menus: [],
  loading: false,
  changingStatusMenuId: null,
  assigningMenuId: null,
};


export default MenuManagementTable;
