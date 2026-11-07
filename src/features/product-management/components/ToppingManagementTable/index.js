import React from "react";
import PropTypes from "prop-types";

import {
  Button,
  Dropdown,
  Popover,
} from "antd";

import {
  EditOutlined,
  MoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import EmptyState from "../../../../shared/components/EmptyState";

import "./ToppingManagementTable.scss";



const getActiveToppings = (
  toppings,
) =>
  Array.isArray(toppings)
    ? toppings.filter(
        (topping) =>
          topping.isActive !==
          false,
      )
    : [];


function ToppingPreview({
  toppings,
}) {
  const activeToppings =
    getActiveToppings(
      toppings,
    );


  if (
    activeToppings.length ===
    0
  ) {
    return (
      <span className="topping-management-table__empty-value">
        Chưa có topping
      </span>
    );
  }


  const preview =
    activeToppings.slice(
      0,
      3,
    );

  const remaining =
    activeToppings.slice(
      3,
    );


  return (
    <div className="topping-management-table__toppings">
      {preview.map(
        (
          topping,
          index,
        ) => (
          <span
            key={
              topping.toppingId ??
              topping.toppingName ??
              index
            }
            className="topping-management-table__topping"
            title={
              topping.toppingName
            }
          >
            {
              topping.toppingName
            }
          </span>
        ),
      )}


      {remaining.length >
      0 ? (
        <Popover
          trigger="click"
          placement="bottom"
          title="Danh sách topping"
          content={
            <div className="topping-management-table__popover">
              {activeToppings.map(
                (
                  topping,
                  index,
                ) => (
                  <div
                    key={
                      topping.toppingId ??
                      topping.toppingName ??
                      index
                    }
                    className="topping-management-table__popover-item"
                  >
                    <div>
                      <strong>
                        {
                          topping.toppingName
                        }
                      </strong>

                      <span>
                        {Number(
                          topping.tapPrice ??
                            0,
                        ).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        ₫
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          }
        >
          <button
            type="button"
            className="topping-management-table__more"
          >
            +{remaining.length} topping
          </button>
        </Popover>
      ) : null}
    </div>
  );
}


function ToppingManagementTable({
  groups,
  loading,
  pagination,
  updatingGroupId,
  updatingToppingsGroupId,
  onPaginationChange,
  onEditGroup,
  onManageToppings,
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
        <span className="topping-management-table__index">
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
        "Tên nhóm",

      dataIndex:
        "name",

      key:
        "name",

      width: 250,

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
        value,
      ) => (
        <span
          className="topping-management-table__name"
          title={value}
        >
          {value ||
            "Chưa đặt tên"}
        </span>
      ),
    },

    {
      title:
        "Topping",

      dataIndex:
        "toppings",

      key:
        "toppings",

      render: (
        toppings,
      ) => (
        <ToppingPreview
          toppings={toppings}
        />
      ),
    },

    {
      title:
        "Giới hạn",

      key:
        "limit",

      width: 180,

      render: (
        _,
        record,
      ) => {
        const min =
          Number(
            record.minPermitted ??
              0,
          );

        const max =
          Number(
            record.maxPermitted ??
              1,
          );


        return (
          <div className="topping-management-table__limit">
            <strong>
              {max <= 1
                ? "Chọn duy nhất"
                : `Tối đa ${max}`}
            </strong>

            <span>
              Tối thiểu {min}
            </span>
          </div>
        );
      },
    },

    {
      title:
        "Số topping",

      key:
        "count",

      width: 120,

      align:
        "center",

      render: (
        _,
        record,
      ) => (
        <span className="topping-management-table__count">
          {
            getActiveToppings(
              record.toppings,
            ).length
          }
        </span>
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
      ) => {
        const busy =
          updatingGroupId ===
            record.id ||
          updatingToppingsGroupId ===
            record.id;


        return (
          <Dropdown
            trigger={[
              "click",
            ]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key:
                    "edit-group",

                  icon:
                    <EditOutlined />,

                  label:
                    "Chỉnh sửa nhóm",

                  onClick:
                    () =>
                      onEditGroup(
                        record,
                      ),
                },

                {
                  type:
                    "divider",
                },

                {
                  key:
                    "manage-toppings",

                  icon:
                    <SettingOutlined />,

                  label:
                    "Quản lý topping",

                  onClick:
                    () =>
                      onManageToppings(
                        record,
                      ),
                },
              ],
            }}
          >
            <Button
              type="text"
              loading={busy}
              icon={
                <MoreOutlined />
              }
              className="topping-management-table__action"
              aria-label="Mở thao tác"
            />
          </Dropdown>
        );
      },
    },
  ];


  const showPagination =
    groups.length >
    pagination.pageSize;


  return (
    <ManagementTable
      className="topping-management-table"
      rowKey={(
        record,
      ) =>
        record.id ??
        record.name
      }
      columns={columns}
      dataSource={groups}
      loading={loading}
      pagination={
        showPagination
          ? {
              current:
                pagination.current,

              pageSize:
                pagination.pageSize,

              total:
                groups.length,

              showSizeChanger:
                false,

              showTotal:
                (total) =>
                  `${total.toLocaleString(
                    "vi-VN",
                  )} nhóm topping`,
            }
          : false
      }
      scroll={{
        x: 1100,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description="Chưa có nhóm topping"
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


ToppingPreview.propTypes = {
  toppings:
    PropTypes.arrayOf(
      PropTypes.object,
    ),
};


ToppingPreview.defaultProps = {
  toppings: [],
};


ToppingManagementTable.propTypes = {
  groups:
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

  updatingGroupId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  updatingToppingsGroupId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  onPaginationChange:
    PropTypes.func.isRequired,

  onEditGroup:
    PropTypes.func.isRequired,

  onManageToppings:
    PropTypes.func.isRequired,
};


ToppingManagementTable.defaultProps = {
  groups: [],
  loading: false,
  updatingGroupId: null,
  updatingToppingsGroupId: null,
};


export default ToppingManagementTable;
