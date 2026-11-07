import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Dropdown } from "antd";

import {
  EditOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import { PAYMENT_TYPE_LABELS } from "../../constants";

import EmptyState from "../../../../shared/components/EmptyState";

import "./AddressManagementTable.scss";


const PAGE_SIZE = 10;

const getAgencyName = (agency) =>
  [agency?.firstName, agency?.lastName].filter(Boolean).join(" ").trim();

function AddressManagementTable({
  addresses,

  loading,

  error,

  resetPageKey,

  mutationAddressId,

  isMutating,

  getAgencyById,

  emptyDescription,

  onOrderInfo,

  onAssignPos,

  onEdit,

  onDeactivate,

  onRetry,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(addresses.length / PAGE_SIZE)),
    [addresses.length],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [resetPageKey]);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  const columns = useMemo(
    () => [
      {
        title: "STT",

        key: "index",

        width: 64,

        align: "center",

        render: (_, __, index) => (
          <span className="address-management-table__index">
            {(currentPage - 1) * PAGE_SIZE + index + 1}
          </span>
        ),
      },

      {
        title: "Địa chỉ",

        dataIndex: "addressName",

        key: "addressName",

        sorter: (first, second) =>
          String(first?.addressName || "").localeCompare(
            String(second?.addressName || ""),
            "vi",
          ),

        render: (addressName) => (
          <div className="address-management-table__address">
            <span
              className="address-management-table__address-name"
              title={addressName}
            >
              {addressName || "Chưa cập nhật"}
            </span>

          </div>
        ),
      },

      {
        title: "Đơn vị",

        dataIndex: "unit",

        key: "unit",

        width: 170,

        sorter: (first, second) =>
          String(first?.unit || "").localeCompare(
            String(second?.unit || ""),
            "vi",
          ),

        render: (unit) =>
          unit ? (
            <span className="address-management-table__unit">{unit}</span>
          ) : (
            <span className="address-management-table__empty-value">
              Chưa có
            </span>
          ),
      },

      {
        title: "Đại lý",

        dataIndex: "agencyId",

        key: "agency",

        width: 210,

        render: (agencyId) => {
          if (agencyId == null) {
            return (
              <span className="address-management-table__unassigned">
                <span className="address-management-table__unassigned-dot" />
                Chưa phân công
              </span>
            );
          }

          const agency = getAgencyById(agencyId);

          const agencyName = getAgencyName(agency);

          return (
            <div className="address-management-table__agency">
              <span className="address-management-table__agency-name">
                {agencyName || `Đại lý #${agencyId}`}
              </span>

              {agency?.phoneNumber ? (
                <span className="address-management-table__agency-phone">
                  {agency.phoneNumber}
                </span>
              ) : null}
            </div>
          );
        },
      },

      {
        title: "Thanh toán",

        dataIndex: "paymentType",

        key: "paymentType",

        width: 210,

        render: (paymentType) => {
          if (!paymentType) {
            return (
              <span className="address-management-table__empty-value">
                Chưa thiết lập
              </span>
            );
          }

          return (
            <span
              className={[
                "address-management-table__payment",

                `address-management-table__payment--${String(paymentType)
                  .toLowerCase()
                  .replace(/_/g, "-")}`,
              ].join(" ")}
            >
              {PAYMENT_TYPE_LABELS[paymentType] || paymentType}
            </span>
          );
        },
      },

      {
        title: "",

        key: "actions",

        width: 72,

        align: "center",

        render: (_, record) => {
          const rowMutating =
            isMutating && mutationAddressId === record?.addressId;

          const canAssignPos = record?.agencyAddressId != null;

          const menuItems = [
            {
              key: "order-info",

              icon: <FileTextOutlined />,

              label: record?.agencyId
                ? "Thông tin đặt hàng"
                : "Thiết lập đặt hàng",

              disabled: isMutating,
            },

            {
              key: "assign-pos",

              icon: <PlusCircleOutlined />,

              label: canAssignPos
                ? "Thêm vào trung tâm"
                : "Cần thiết lập đặt hàng trước",

              disabled: isMutating || !canAssignPos,
            },

            {
              key: "edit",

              icon: <EditOutlined />,

              label: "Chỉnh sửa địa chỉ",

              disabled: isMutating,
            },

            {
              type: "divider",
            },

            {
              key: "deactivate",

              icon: <StopOutlined />,

              label: "Vô hiệu hóa",

              danger: true,

              disabled: isMutating,
            },
          ];

          const handleMenuClick = ({ key, domEvent }) => {
            domEvent?.stopPropagation();

            if (key === "order-info") {
              onOrderInfo(record);

              return;
            }

            if (key === "assign-pos") {
              onAssignPos(record);

              return;
            }

            if (key === "edit") {
              onEdit(record);

              return;
            }

            if (key === "deactivate") {
              onDeactivate(record);
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
              overlayClassName="address-management-table__dropdown"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                loading={rowMutating}
                disabled={isMutating && !rowMutating}
                aria-label="Mở menu thao tác"
                className="address-management-table__more-button"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            </Dropdown>
          );
        },
      },
    ],
    [
      currentPage,
      getAgencyById,
      isMutating,
      mutationAddressId,
      onAssignPos,
      onDeactivate,
      onEdit,
      onOrderInfo,
    ],
  );

  const emptyContent = error ? (
    <div className="address-management-table__state">
      <div className="address-management-table__state-title">
        Không thể tải danh sách địa chỉ
      </div>

      <div className="address-management-table__state-description">
        Đã có lỗi khi tải dữ liệu.
      </div>

      {onRetry ? (
        <Button
          icon={<ReloadOutlined />}
          className="address-management-table__retry"
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

  return (
    <ManagementTable
      rowKey="addressId"
      className="address-management-table"
      columns={columns}
      dataSource={addresses}
      loading={{
        spinning: loading,

        tip: "Đang tải danh sách địa chỉ...",
      }}
      scroll={{
        x: 1050,
      }}
      locale={{
        emptyText: emptyContent,
      }}
      pagination={{
        current: currentPage,

        pageSize: PAGE_SIZE,

        total: addresses.length,

        showSizeChanger: false,

        showQuickJumper: false,

        hideOnSinglePage: true,

        showTotal: (total) => `${total} địa chỉ`,
      }}
      onChange={(pagination) => {
        setCurrentPage(pagination.current || 1);
      }}
    />
  );
}

AddressManagementTable.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      addressId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

      addressName: PropTypes.string,

      unit: PropTypes.string,

      agencyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

      agencyAddressId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),

      paymentType: PropTypes.string,
    }),
  ),

  loading: PropTypes.bool,

  error: PropTypes.any,

  resetPageKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  mutationAddressId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  isMutating: PropTypes.bool,

  getAgencyById: PropTypes.func.isRequired,

  emptyDescription: PropTypes.node,

  onOrderInfo: PropTypes.func.isRequired,

  onAssignPos: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,

  onDeactivate: PropTypes.func.isRequired,

  onRetry: PropTypes.func,
};

AddressManagementTable.defaultProps = {
  addresses: [],

  loading: false,

  error: null,

  resetPageKey: "",

  mutationAddressId: null,

  isMutating: false,

  emptyDescription: "Chưa có địa chỉ nào.",

  onRetry: null,
};

export default AddressManagementTable;
