import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Dropdown, Tooltip } from "antd";

import {
  EditOutlined,
  LinkOutlined,
  MoreOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import { formatVnd } from "../../../../shared/utils/money";

import EmptyState from "../../../../shared/components/EmptyState";

import "./PosAddressTable.scss";


const PAGE_SIZE = 10;

function PosAddressTable({
  addresses,

  loading,

  error,

  resetPageKey,

  isMutating,

  mutationPosAgencyId,

  emptyDescription,

  onCopyLink,

  onEditFee,

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
          <span className="pos-address-table__index">
            {(currentPage - 1) * PAGE_SIZE + index + 1}
          </span>
        ),
      },

      {
        title: "Địa chỉ",

        dataIndex: "address",

        key: "address",

        sorter: (first, second) =>
          String(first?.address || "").localeCompare(
            String(second?.address || ""),
            "vi",
          ),

        render: (address) => (
          <div className="pos-address-table__address">
            <span className="pos-address-table__address-name" title={address}>
              {address || "Chưa cập nhật"}
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
            <span className="pos-address-table__unit">{unit}</span>
          ) : (
            <span className="pos-address-table__empty">Chưa có</span>
          ),
      },

      {
        title: "Phí giao hàng",

        dataIndex: "feeShip",

        key: "feeShip",

        width: 180,

        sorter: (first, second) =>
          Number(first?.feeShip || 0) - Number(second?.feeShip || 0),

        render: (feeShip) => {
          const formattedFee = formatVnd(feeShip);

          return formattedFee ? (
            <span className="pos-address-table__fee">{formattedFee}</span>
          ) : (
            <span className="pos-address-table__empty">Chưa thiết lập</span>
          );
        },
      },

      {
        title: "Đường dẫn đặt hàng",

        dataIndex: "orderLink",

        key: "orderLink",

        width: 200,

        render: (orderLink, record) => {
          if (!orderLink) {
            return <span className="pos-address-table__empty">Chưa có</span>;
          }

          return (
            <Tooltip title="Nhấn để sao chép đường dẫn" placement="top">
              <Button
                type="text"
                icon={<LinkOutlined />}
                disabled={isMutating}
                className="pos-address-table__link-status"
                onClick={(event) => {
                  event.stopPropagation();

                  onCopyLink(record);
                }}
              >
                Sẵn sàng
              </Button>
            </Tooltip>
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
            isMutating && mutationPosAgencyId === record?.posAgencyId;

          const menuItems = [
            {
              key: "edit-fee",

              icon: <EditOutlined />,

              label: "Chỉnh sửa phí giao hàng",

              disabled: isMutating,
            },

            {
              type: "divider",
            },

            {
              key: "deactivate",

              icon: <StopOutlined />,

              label: "Vô hiệu hóa khỏi trung tâm",

              danger: true,

              disabled: isMutating,
            },
          ];

          const handleMenuClick = ({ key, domEvent }) => {
            domEvent?.stopPropagation();

            if (key === "edit-fee") {
              onEditFee(record);

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
              overlayClassName="pos-address-table__dropdown"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                loading={rowMutating}
                disabled={isMutating && !rowMutating}
                aria-label="Mở menu thao tác"
                className="pos-address-table__more-button"
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
      isMutating,
      mutationPosAgencyId,
      onCopyLink,
      onDeactivate,
      onEditFee,
    ],
  );

  const emptyContent = error ? (
    <div className="pos-address-table__state">
      <div className="pos-address-table__state-title">
        Không thể tải danh sách địa chỉ
      </div>

      <div className="pos-address-table__state-description">
        Đã có lỗi khi tải dữ liệu của trung tâm hiện tại.
      </div>

      {onRetry ? (
        <Button
          icon={<ReloadOutlined />}
          className="pos-address-table__retry"
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
      rowKey="posAgencyId"
      className="pos-address-table"
      columns={columns}
      dataSource={addresses}
      loading={{
        spinning: loading,

        tip: "Đang tải địa chỉ...",
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

PosAddressTable.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      posAgencyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

      address: PropTypes.string,

      unit: PropTypes.string,

      feeShip: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

      orderLink: PropTypes.string,
    }),
  ),

  loading: PropTypes.bool,

  error: PropTypes.any,

  resetPageKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  isMutating: PropTypes.bool,

  mutationPosAgencyId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),

  emptyDescription: PropTypes.node,

  onCopyLink: PropTypes.func.isRequired,

  onEditFee: PropTypes.func.isRequired,

  onDeactivate: PropTypes.func.isRequired,

  onRetry: PropTypes.func,
};

PosAddressTable.defaultProps = {
  addresses: [],

  loading: false,

  error: null,

  resetPageKey: "",

  isMutating: false,

  mutationPosAgencyId: null,

  emptyDescription: "Chưa có địa chỉ nào.",

  onRetry: null,
};

export default PosAddressTable;
