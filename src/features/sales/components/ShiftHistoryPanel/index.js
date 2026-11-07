import PropTypes from "prop-types";
import { Alert, Button, Drawer, Empty, Table, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ManagementTable from "../../../../shared/components/ManagementTable";
import { useShiftHistory } from "../../hooks";
import {
  displayShiftNumber,
  displayShiftValue,
  getAuditBeforeAfter,
} from "../../utils/shiftHistory";

import "./ShiftHistoryPanel.scss";

dayjs.extend(utc);
dayjs.extend(timezone);

const formatTimestamp = (value) => {
  if (!value) return "—";

  // PostgreSQL timestamp without time zone.
  // Backend lưu giờ UTC, hiển thị sang Việt Nam.
  const parsed = dayjs.utc(value).tz("Asia/Ho_Chi_Minh");

  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : String(value);
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Vui lòng thử lại.";

const money = (value) =>
  value == null ? "—" : `${displayShiftNumber(value)} ₫`;

const renderStatus = (value) => {
  if (!value) return "—";
  const status = String(value).toUpperCase();
  const color =
    status === "OPEN" || status === "ACTIVE"
      ? "green"
      : status === "CLOSED" || status === "COMPLETED"
        ? "default"
        : "gold";

  const labels = {
    OPENED: "Đang mở",
    OPEN: "Đang mở",
    ACTIVE: "Đang mở",
    CLOSED: "Đã đóng",
    COMPLETED: "Đã đóng",
  };
  return <Tag color={color}>{labels[status] || displayShiftValue(value)}</Tag>;
};

const auditTypeLabel = (type) =>
  ({
    INITIAL_QUANTITY: "Số suất ban đầu",
    ITEM_QUANTITATIVE: "Định lượng món",
    TOPPING_QUANTITATIVE: "Định lượng topping",
    TOPPING_TARGET_ITEM: "Đổi món trừ tồn",
  })[type] || displayShiftValue(type);

const renderAuditChange = (row) => {
  const { before, after } = getAuditBeforeAfter(row);

  if (before == null && after == null) return "—";

  return (
    <span className="shift-history__change">
      <span>{displayShiftNumber(before)}</span>
      <span aria-hidden="true">→</span>
      <strong>{displayShiftNumber(after)}</strong>
    </span>
  );
};

function ShiftHistoryPanel({ posId }) {
  const {
    page,
    setPage,
    rows,
    total,
    loading,
    error,
    refresh,
    selectedShiftId,
    selectShift,
    closeDetail,
    detail,
    detailLoading,
    detailError,
    retryDetail,
  } = useShiftHistory(posId);

  const isOpenShift = ["OPENED", "OPEN", "ACTIVE"].includes(
    String(detail?.status || "").toUpperCase(),
  );

  const columns = [
    {
      title: "STT",
      key: "ordinal",
      width: 68,
      align: "center",
      render: (_, __, index) => page * 20 + index + 1,
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      width: 195,
      render: (value) => (
        <span className="shift-history__datetime">
          {formatTimestamp(value)}
        </span>
      ),
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      width: 195,
      render: (value) => (
        <span className="shift-history__datetime">
          {value ? formatTimestamp(value) : "Chưa kết thúc"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 116,
      render: renderStatus,
    },
    {
      title: "Số đơn",
      dataIndex: "totalOrder",
      width: 100,
      align: "right",
      render: displayShiftNumber,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalPrice",
      width: 160,
      align: "right",
      render: money,
    },
    // {
    //   title: "",
    //   key: "action",
    //   width: 120,
    //   align: "right",
    //   render: (_, row) => (
    //     <Button type="link" onClick={() => selectShift(row.shiftId)}>
    //       Xem chi tiết
    //     </Button>
    //   ),
    // },
  ];

  const itemColumns = [
    {
      title: "Tên món",
      dataIndex: "itemName",
      key: "itemName",
      render: (name) => (
        <strong className="shift-history__dish">
          {displayShiftValue(name)}
        </strong>
      ),
    },
    {
      title: "Ban đầu",
      dataIndex: "initialQuantity",
      key: "initialQuantity",
      width: 110,
      align: "right",
      render: displayShiftNumber,
    },
    {
      title: "Đã bán",
      dataIndex: "totalItem",
      key: "totalItem",
      width: 105,
      align: "right",
      render: (value) =>
        isOpenShift ? (
          <span className="shift-history__muted">—</span>
        ) : (
          <strong>{displayShiftNumber(value)}</strong>
        ),
    },
    // {
    //   title: "Doanh thu",
    //   key: "revenue",
    //   width: 155,
    //   align: "right",
    //   render: (_, row) => row.revenue == null
    //     ? <span className="shift-history__muted">—</span>
    //     : <strong className="shift-history__revenue">
    //         {money(row.revenue)}
    //       </strong>,
    // },
  ];

  const auditColumns = [
    {
      title: "Thời điểm / Người sửa",
      key: "actor",
      width: 190,
      render: (_, row) => (
        <div className="shift-history__cell-stack">
          <strong>{formatTimestamp(row.changedAt)}</strong>
          <span>{displayShiftValue(row.changedBy)}</span>
        </div>
      ),
    },
    {
      title: "Nội dung",
      key: "content",
      width: 230,
      render: (_, row) => (
        <div className="shift-history__cell-stack">
          <strong>
            {displayShiftValue(
              row.toppingName || row.itemName || row.toppingGroupName,
            )}
          </strong>

          {row.toppingName && row.itemName && (
            <span>Thuộc món: {row.itemName}</span>
          )}

          <span className="shift-history__audit-type">
            {auditTypeLabel(row.adjustmentType)}
          </span>
        </div>
      ),
    },
    {
      title: "Trước → Sau",
      key: "value",
      width: 145,
      render: (_, row) => renderAuditChange(row),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (value) =>
        value?.trim() ? (
          value
        ) : (
          <span className="shift-history__muted">Không có</span>
        ),
    },
  ];

  return (
    <section className="shift-history">
      <div className="shift-history__toolbar">
        <div>
          <h2>Lịch sử các ca</h2>
          <p>Chọn một ca để xem chi tiết nguyên liệu và lịch sử chỉnh sửa.</p>
        </div>
        <Button icon={<ReloadOutlined />} disabled={loading} onClick={refresh}>
          Tải lại
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải lịch sử ca"
          description={getErrorMessage(error)}
          action={
            <Button size="small" onClick={refresh}>
              Thử lại
            </Button>
          }
        />
      )}

      {!error && (
        <ManagementTable
          columns={columns}
          dataSource={rows}
          rowKey="shiftId"
          loading={loading}
          scroll={{ x: 960 }}
          locale={{
            emptyText: <Empty description="Chưa có ca nào trong lịch sử" />,
          }}
          pagination={{
            current: page + 1,
            pageSize: 20,
            total,
            showSizeChanger: false,
            hideOnSinglePage: true,
          }}
          onChange={(pagination) => setPage((pagination.current || 1) - 1)}
          onRow={(record) => ({
            onClick: () => selectShift(record.shiftId),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectShift(record.shiftId);
              }
            },
            tabIndex: 0,
            role: "button",
            className: "shift-history__clickable-row",
          })}
        />
      )}

      <Drawer
        title={`Chi tiết ca #${displayShiftValue(selectedShiftId)}`}
        open={selectedShiftId != null}
        onClose={closeDetail}
        width={760}
        destroyOnClose
        className="shift-history__drawer"
      >
        {detailLoading ? (
          <div className="shift-history__loading">Đang tải chi tiết ca...</div>
        ) : detailError ? (
          <Alert
            type="error"
            showIcon
            message="Không thể tải chi tiết ca"
            description={getErrorMessage(detailError)}
            action={
              <Button size="small" onClick={retryDetail}>
                Thử lại
              </Button>
            }
          />
        ) : detail ? (
          <div className="shift-history__detail">
            <div className="shift-history__summary">
              <div className="shift-history__summary-card">
                <span>Bắt đầu</span>
                <strong>{formatTimestamp(detail.startTime)}</strong>
                <small>
                  {detail.endTime
                    ? `Kết thúc: ${formatTimestamp(detail.endTime)}`
                    : "Chưa kết thúc"}
                </small>
              </div>

              <div className="shift-history__summary-card">
                <span>Trạng thái</span>
                <div>{renderStatus(detail.status)}</div>
              </div>

              <div className="shift-history__summary-card">
                <span>Số đơn</span>
                <strong>
                  {isOpenShift ? "—" : displayShiftNumber(detail.totalOrder)}
                </strong>
              </div>

              <div className="shift-history__summary-card">
                <span>Doanh thu cả ca</span>
                <strong>{isOpenShift ? "—" : money(detail.totalPrice)}</strong>
              </div>
            </div>

            <section className="shift-history__section">
              <div className="shift-history__section-heading">
                <div>
                  <h3>Danh sách món</h3>
                  <p>Thống kê số lượng và doanh thu theo món.</p>
                </div>
                <span>{detail.items.length} món</span>
              </div>

              <Table
                className="shift-history__styled-table"
                size="middle"
                rowKey={(row) => row.shiftItemId ?? row.itemId}
                dataSource={detail.items}
                columns={itemColumns}
                pagination={false}
                scroll={{ x: 630 }}
                locale={{
                  emptyText: <Empty description="Chưa có dữ liệu món" />,
                }}
              />

              {/* {(isOpenShift ||
                detail.items.some((item) => item.revenue == null)) && (
                <p className="shift-history__note">
                  {isOpenShift
                    ? "Ca đang mở: số đã bán và doanh thu chưa được chốt vào lịch sử."
                    : "Doanh thu từng món chưa được API cung cấp. Dấu — không có nghĩa là 0 ₫."}
                </p>
              )} */}
            </section>

            {/* <section className="shift-history__section">
              <div className="shift-history__section-heading">
                <div>
                  <h3>Lịch sử chỉnh sửa</h3>
                  <p>Theo dõi các thay đổi trong ca.</p>
                </div>
                <span>{detail.adjustments.length} thay đổi</span>
              </div>

              <Table
                className="shift-history__styled-table"
                size="middle"
                rowKey={(row, index) => row.id ?? index}
                dataSource={detail.adjustments}
                columns={auditColumns}
                pagination={{
                  pageSize: 10,
                  hideOnSinglePage: true,
                }}
                scroll={{ x: 760 }}
                locale={{
                  emptyText: (
                    <Empty description="Chưa có lịch sử chỉnh sửa" />
                  ),
                }}
              />
            </section> */}
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}

ShiftHistoryPanel.propTypes = {
  posId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ShiftHistoryPanel;
