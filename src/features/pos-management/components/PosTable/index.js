import React, {
  useMemo,
} from "react";

import PropTypes from "prop-types";

import {
  Button,
  Dropdown,
  Spin,
  Table,
  Tooltip,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import {
  formatPhoneNumberWithRegion,
} from "../../../../helpers";

import "./PosTable.scss";


function PosTable({
  posList,
  loading,
  error,
  updatingPosId,
  deactivatingPosName,
  onEdit,
  onDeactivate,
  onRetry,
}) {
  const activePosList =
    useMemo(
      () =>
        posList.filter(
          (pos) =>
            pos.isActive !==
            false,
        ),
      [posList],
    );


  const columns =
    useMemo(
      () => [
        {
          title: "STT",
          key: "index",
          width: 72,
          align: "center",

          render: (
            _,
            __,
            index,
          ) => (
            <span className="pos-table__index">
              {index + 1}
            </span>
          ),
        },

        {
          title:
            "Tên trung tâm",

          dataIndex:
            "posName",

          key:
            "posName",

          width: 240,

          sorter:
            (
              a,
              b,
            ) =>
              (
                a.posName ||
                ""
              ).localeCompare(
                b.posName ||
                  "",
              ),

          render:
            (value) => (
              <span
                className="pos-table__name"
                title={
                  value ||
                  ""
                }
              >
                {value ||
                  "Chưa cập nhật"}
              </span>
            ),
        },

        {
          title:
            "Địa chỉ",

          dataIndex:
            "posAddress",

          key:
            "posAddress",

          width: 420,

          sorter:
            (
              a,
              b,
            ) =>
              (
                a.posAddress ||
                ""
              ).localeCompare(
                b.posAddress ||
                  "",
              ),

          render:
            (value) => (
              <span
                className="pos-table__address"
                title={
                  value ||
                  ""
                }
              >
                {value ||
                  "Chưa cập nhật"}
              </span>
            ),
        },

        {
          title:
            "Số điện thoại",

          dataIndex:
            "phone",

          key:
            "phone",

          width: 180,

          render:
            (phone) => (
              <span className="pos-table__phone">
                {phone
                  ? formatPhoneNumberWithRegion(
                      phone,
                    )
                  : "Chưa cập nhật"}
              </span>
            ),
        },

        {
          title: "",
          key:
            "actions",
          width: 104,
          align: "right",
          fixed: "right",

          render:
            (
              _,
              pos,
            ) => {
              const isUpdating =
                String(
                  updatingPosId,
                ) ===
                String(
                  pos.posId,
                );

              const isDeactivating =
                deactivatingPosName ===
                pos.posName;

              const isBusy =
                isUpdating ||
                isDeactivating;


              const menuItems = [
                {
                  key:
                    "delete",

                  label:
                    "Xóa trung tâm",

                  icon:
                    <DeleteOutlined />,

                  danger:
                    true,

                  disabled:
                    isBusy,
                },
              ];


              const handleMenuClick =
                ({
                  key,
                  domEvent,
                }) => {
                  domEvent?.stopPropagation();

                  if (
                    key ===
                    "delete"
                  ) {
                    onDeactivate(
                      pos.posName,
                    );
                  }
                };


              return (
                <div className="pos-table__actions">
                  <Tooltip
                    title="Chỉnh sửa"
                    placement="top"
                  >
                    <Button
                      type="text"
                      aria-label="Chỉnh sửa trung tâm"
                      icon={
                        <EditOutlined />
                      }
                      loading={
                        isUpdating
                      }
                      disabled={
                        isDeactivating
                      }
                      className="pos-table__action-button pos-table__action-button--edit"
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        onEdit(
                          pos,
                        );
                      }}
                    />
                  </Tooltip>

                  <Dropdown
                    trigger={[
                      "click",
                    ]}
                    placement="bottomRight"
                    disabled={
                      isBusy
                    }
                    menu={{
                      items:
                        menuItems,

                      onClick:
                        handleMenuClick,
                    }}
                    overlayClassName="pos-table__action-dropdown"
                  >
                    <Tooltip
                      title="Thêm thao tác"
                      placement="top"
                    >
                      <Button
                        type="text"
                        aria-label="Thêm thao tác"
                        icon={
                          <MoreOutlined />
                        }
                        loading={
                          isDeactivating
                        }
                        disabled={
                          isUpdating
                        }
                        className="pos-table__action-button pos-table__action-button--more"
                        onClick={(
                          event,
                        ) =>
                          event.stopPropagation()
                        }
                      />
                    </Tooltip>
                  </Dropdown>
                </div>
              );
            },
        },
      ],
      [
        deactivatingPosName,
        onDeactivate,
        onEdit,
        updatingPosId,
      ],
    );


  if (loading) {
    return (
      <div className="pos-table">
        <div className="pos-table__state">
          <Spin
            size="large"
          />
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="pos-table">
        <div className="pos-table__state">
          <div className="pos-table__state-icon pos-table__state-icon--error">
            <WarningOutlined />
          </div>

          <strong>
            Không thể tải danh sách trung tâm
          </strong>

          <span>
            Đã xảy ra lỗi khi tải dữ liệu.
            Vui lòng thử lại.
          </span>

          <Button
            icon={
              <ReloadOutlined />
            }
            className="pos-table__retry"
            onClick={
              onRetry
            }
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="pos-table">
      <div className="pos-table__viewport">
        <Table
          rowKey="posId"
          columns={
            columns
          }
          dataSource={
            activePosList
          }
          tableLayout="fixed"
          scroll={{
            x: 1016,
          }}
          pagination={
            activePosList.length >
            10
              ? {
                  defaultPageSize:
                    10,

                  showSizeChanger:
                    true,

                  pageSizeOptions: [
                    "10",
                    "20",
                    "50",
                  ],

                  showTotal:
                    (
                      total,
                    ) =>
                      `${total} trung tâm`,
                }
              : false
          }
          locale={{
            emptyText: (
              <div className="pos-table__empty">
                <div className="pos-table__empty-icon">
                  <InboxOutlined />
                </div>

                <strong>
                  Chưa có trung tâm
                </strong>

                <span>
                  Thêm trung tâm đầu tiên để bắt đầu quản lý.
                </span>
              </div>
            ),
          }}
          className="pos-table__antd"
        />
      </div>
    </div>
  );
}


PosTable.propTypes = {
  posList:
    PropTypes.arrayOf(
      PropTypes.shape({
        posId:
          PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),

        posName:
          PropTypes.string,

        posAddress:
          PropTypes.string,

        phone:
          PropTypes.string,

        isActive:
          PropTypes.bool,
      }),
    ),

  loading:
    PropTypes.bool,

  error:
    PropTypes.any,

  updatingPosId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  deactivatingPosName:
    PropTypes.string,

  onEdit:
    PropTypes.func.isRequired,

  onDeactivate:
    PropTypes.func.isRequired,

  onRetry:
    PropTypes.func.isRequired,
};


PosTable.defaultProps = {
  posList: [],
  loading: false,
  error: null,
  updatingPosId: null,
  deactivatingPosName: null,
};


export default PosTable;