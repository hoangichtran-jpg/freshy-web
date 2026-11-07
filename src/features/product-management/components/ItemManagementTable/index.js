import React from "react";
import PropTypes from "prop-types";

import {
  Button,
  Dropdown,
  Popover,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import EmptyState from "../../../../shared/components/EmptyState";

import "./ItemManagementTable.scss";



const formatPrice = (
  value,
) =>
  new Intl.NumberFormat(
    "vi-VN",
  ).format(
    Number(value) ||
      0,
  );


function ToppingGroups({
  groups,
}) {
  const availableGroups =
    Array.isArray(groups)
      ? groups.filter(Boolean)
      : [];


  if (
    availableGroups.length ===
    0
  ) {
    return (
      <span className="item-management-table__empty-value">
        Không có topping
      </span>
    );
  }


  const preview =
    availableGroups.slice(
      0,
      2,
    );

  const remaining =
    availableGroups.length -
    preview.length;


  return (
    <div className="item-management-table__groups">
      {preview.map(
        (
          group,
          index,
        ) => (
          <span
            key={
              group.id ??
              group.name ??
              index
            }
            className="item-management-table__group"
            title={
              group.name
            }
          >
            {group.name}
          </span>
        ),
      )}


      {remaining >
      0 ? (
        <Popover
          trigger="click"
          placement="bottom"
          title="Nhóm topping"
          content={
            <div className="item-management-table__popover">
              {availableGroups.map(
                (
                  group,
                  index,
                ) => {
                  const toppings =
                    (
                      group.toppings ||
                      []
                    ).filter(
                      (
                        topping,
                      ) =>
                        topping.isActive !==
                        false,
                    );


                  return (
                    <div
                      key={
                        group.id ??
                        group.name ??
                        index
                      }
                      className="item-management-table__popover-group"
                    >
                      <strong>
                        {group.name}
                      </strong>

                      <span>
                        {toppings.length >
                        0
                          ? toppings
                              .map(
                                (
                                  topping,
                                ) =>
                                  topping.toppingName,
                              )
                              .join(", ")
                          : "Chưa có topping"}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          }
        >
          <button
            type="button"
            className="item-management-table__more"
          >
            +{remaining} nhóm
          </button>
        </Popover>
      ) : null}
    </div>
  );
}


function ItemManagementTable({
  items,
  loading,
  pagination,
  deletingItemId,
  onPaginationChange,
  onEdit,
  onDelete,
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
        <span className="item-management-table__index">
          {(pagination.current -
            1) *
            pagination.pageSize +
            index +
            1}
        </span>
      ),
    },

    {
      title: "Ảnh",

      dataIndex:
        "imagePath",

      key:
        "imagePath",

      width: 76,

      render: (
        imagePath,
        record,
      ) => (
        <div className="item-management-table__image">
          {imagePath ? (
            <img
              src={imagePath}
              alt={
                record.name ||
                "Món ăn"
              }
            />
          ) : (
            <span>
              {String(
                record.name ||
                  "?",
              )
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>
      ),
    },

    {
      title:
        "Tên món",

      dataIndex:
        "name",

      key:
        "name",

      width: 280,

      sorter: (
        first,
        second,
      ) =>
        String(
          first.name ||
            "",
        ).localeCompare(
          String(
            second.name ||
              "",
          ),
          "vi",
        ),

      render: (
        name,
      ) => (
        <span
          className="item-management-table__name"
          title={name}
        >
          {name ||
            "Chưa đặt tên"}
        </span>
      ),
    },

    {
      title:
        "Giá bán",

      dataIndex:
        "taPrice",

      key:
        "taPrice",

      width: 150,

      align:
        "right",

      sorter: (
        first,
        second,
      ) =>
        Number(
          first.taPrice ||
            0,
        ) -
        Number(
          second.taPrice ||
            0,
        ),

      render: (
        value,
      ) => (
        <span className="item-management-table__price">
          {formatPrice(
            value,
          )}{" "}
          ₫
        </span>
      ),
    },

    {
      title:
        "Nhóm topping",

      dataIndex:
        "toppingDTO",

      key:
        "toppingDTO",

      render: (
        groups,
      ) => (
        <ToppingGroups
          groups={groups}
        />
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
                  "edit",

                icon:
                  <EditOutlined />,

                label:
                  "Chỉnh sửa món",

                onClick:
                  () =>
                    onEdit(
                      record,
                    ),
              },

              {
                type:
                  "divider",
              },

              {
                key:
                  "delete",

                danger:
                  true,

                icon:
                  <DeleteOutlined />,

                label:
                  "Xóa món",

                onClick:
                  () =>
                    onDelete(
                      record,
                    ),
              },
            ],
          }}
        >
          <Button
            type="text"
            loading={
              deletingItemId ===
              record.itemId
            }
            icon={
              <MoreOutlined />
            }
            className="item-management-table__action"
            aria-label="Mở thao tác"
          />
        </Dropdown>
      ),
    },
  ];


  const showPagination =
    items.length >
    pagination.pageSize;


  return (
    <ManagementTable
      className="item-management-table"
      rowKey={(
        record,
      ) =>
        record.itemId ??
        record.name
      }
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={
        showPagination
          ? {
              current:
                pagination.current,

              pageSize:
                pagination.pageSize,

              total:
                items.length,

              showSizeChanger:
                false,

              showTotal:
                (total) =>
                  `${total.toLocaleString(
                    "vi-VN",
                  )} món`,
            }
          : false
      }
      scroll={{
        x: 1050,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description="Chưa có món ăn"
          />
        ),
      }}
      onChange={(
        nextPagination,
      ) => {
        onPaginationChange({
          current:
            nextPagination.current ||
            1,

          pageSize:
            pagination.pageSize,
        });
      }}
    />
  );
}


ToppingGroups.propTypes = {
  groups:
    PropTypes.arrayOf(
      PropTypes.object,
    ),
};


ToppingGroups.defaultProps = {
  groups: [],
};


ItemManagementTable.propTypes = {
  items:
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
    }).isRequired,

  deletingItemId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  onPaginationChange:
    PropTypes.func.isRequired,

  onEdit:
    PropTypes.func.isRequired,

  onDelete:
    PropTypes.func.isRequired,
};


ItemManagementTable.defaultProps = {
  items: [],
  loading: false,
  deletingItemId: null,
};


export default ItemManagementTable;
