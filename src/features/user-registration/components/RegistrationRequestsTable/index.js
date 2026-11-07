import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import PropTypes from "prop-types";

import {
  Button,
} from "antd";

import {
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import ManagementTable from "../../../../shared/components/ManagementTable";

import EmptyState from "../../../../shared/components/EmptyState";

import "./RegistrationRequestsTable.scss";



const PAGE_SIZE = 10;


function RegistrationRequestsTable({
  requests,
  loading,
  processingId,
  processingAction,
  isProcessing,
  emptyDescription,
  resetPageKey,
  onApprove,
  onReject,
}) {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  const totalPages =
    useMemo(
      () =>
        Math.max(
          1,
          Math.ceil(
            requests.length /
              PAGE_SIZE,
          ),
        ),
      [
        requests.length,
      ],
    );


  /*
   * Search/filter đổi thì quay về page 1.
   *
   * Không dùng requests.length làm trigger
   * vì approve/reject một row không nên
   * tự động đá user về page đầu.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    resetPageKey,
  ]);


  /*
   * Nếu đang ở page cuối và xử lý row làm
   * page đó biến mất thì chỉ lùi về page
   * hợp lệ gần nhất.
   */
  useEffect(() => {
    setCurrentPage(
      (
        previous,
      ) =>
        Math.min(
          previous,
          totalPages,
        ),
    );
  }, [
    totalPages,
  ]);


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
        <span className="registration-requests-table__index">
          {(currentPage - 1) *
            PAGE_SIZE +
            index +
            1}
        </span>
      ),
    },

    {
      title: "Họ tên",

      dataIndex: "name",

      key: "name",

      width: 230,

      render: (
        value,
      ) => (
        <span
          className="registration-requests-table__name"
          title={
            value || ""
          }
        >
          {value ||
            "Chưa có thông tin"}
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

      width: 170,

      render: (
        value,
      ) => (
        <span className="registration-requests-table__phone">
          {value || "—"}
        </span>
      ),
    },

    {
      title: "Địa chỉ",

      dataIndex:
        "address",

      key:
        "address",

      render: (
        value,
      ) => (
        <span
          className="registration-requests-table__address"
          title={
            value || ""
          }
        >
          {value || "—"}
        </span>
      ),
    },

    {
      title: "Thao tác",

      key: "actions",

      width: 215,

      fixed: "right",

      render: (
        _,
        record,
      ) => {
        const approving =
          processingId ===
            record.id &&
          processingAction ===
            "approve";


        const rejecting =
          processingId ===
            record.id &&
          processingAction ===
            "reject";


        return (
          <div className="registration-requests-table__actions">
            <Button
              icon={
                <CheckOutlined />
              }
              loading={
                approving
              }
              disabled={
                isProcessing &&
                !approving
              }
              className="registration-requests-table__approve"
              onClick={() =>
                onApprove(
                  record,
                )
              }
            >
              Phê duyệt
            </Button>


            <Button
              icon={
                <CloseOutlined />
              }
              loading={
                rejecting
              }
              disabled={
                isProcessing &&
                !rejecting
              }
              className="registration-requests-table__reject"
              onClick={() =>
                onReject(
                  record,
                )
              }
            >
              Từ chối
            </Button>
          </div>
        );
      },
    },
  ];


  const showPagination =
    requests.length >
    PAGE_SIZE;


  return (
    <ManagementTable
      rowKey="id"
      className="registration-requests-table"
      columns={
        columns
      }
      dataSource={
        requests
      }
      loading={
        loading
      }
      scroll={{
        x: 920,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description={
              emptyDescription
            }
          />
        ),
      }}
      pagination={
        showPagination
          ? {
              current:
                currentPage,

              pageSize:
                PAGE_SIZE,

              total:
                requests.length,

              showSizeChanger:
                false,

              showQuickJumper:
                false,

              showTotal: (
                total,
              ) =>
                `${total} yêu cầu`,
            }
          : false
      }
      onChange={(
        pagination,
      ) => {
        setCurrentPage(
          pagination.current ||
            1,
        );
      }}
    />
  );
}


RegistrationRequestsTable.propTypes = {
  requests:
    PropTypes.arrayOf(
      PropTypes.shape({
        id:
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
          ]).isRequired,

        name:
          PropTypes.string,

        phone:
          PropTypes.string,

        address:
          PropTypes.string,
      }),
    ),

  loading:
    PropTypes.bool,

  processingId:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

  processingAction:
    PropTypes.oneOf([
      "approve",
      "reject",
    ]),

  isProcessing:
    PropTypes.bool,

  emptyDescription:
    PropTypes.node,

  resetPageKey:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

  onApprove:
    PropTypes.func
      .isRequired,

  onReject:
    PropTypes.func
      .isRequired,
};


RegistrationRequestsTable.defaultProps = {
  requests: [],
  loading: false,
  processingId: null,
  processingAction: null,
  isProcessing: false,

  emptyDescription:
    "Không có yêu cầu đăng ký",

  resetPageKey: "",

};


export default RegistrationRequestsTable;
