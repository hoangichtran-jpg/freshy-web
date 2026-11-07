import { useMemo, useState } from "react";

import PropTypes from "prop-types";

import {
  Button,
  Checkbox,
  Table,
  Tooltip,
} from "antd";

import { FilterFilled, SearchOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

import { formatPhoneNumberWithRegion } from "../../../../helpers";

import { getOrderTotalItems } from "../../utils/order.utils";

import SearchInput from "../../../../shared/components/SearchInput";

import EmptyState from "../../../../shared/components/EmptyState";

import "./OrderTable.scss";


const PAGE_SIZE = 10;

/* ========================================
   Search helpers
======================================== */

const normalizeSearchText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

function OrderTable({
  data,
  loading,
  unitOptions,
  onDetail,
  emptyMessage = "Không có đơn hàng",
  currentPage,
  onPageChange,
}) {
  const [unitKeyword, setUnitKeyword] = useState("");

  /* ========================================
     Unit filter options
  ======================================== */

  const normalizedUnitOptions = useMemo(() => {
    return Array.from(
      new Set(
        (unitOptions || [])
          .filter(Boolean)
          .map((unit) => String(unit).trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "vi", {
        sensitivity: "base",
      }),
    );
  }, [unitOptions]);

  const filteredUnitOptions = useMemo(() => {
    const keyword = normalizeSearchText(unitKeyword);

    if (!keyword) {
      return normalizedUnitOptions;
    }

    return normalizedUnitOptions.filter((unit) =>
      normalizeSearchText(unit).includes(keyword),
    );
  }, [normalizedUnitOptions, unitKeyword]);

  /* ========================================
     Columns
  ======================================== */

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      width: 72,
      align: "center",

      render: (_, __, index) => (currentPage - 1) * PAGE_SIZE + index + 1,
    },

    /* ======================================
       Unit
    ====================================== */

    {
      title: <span className="order-table__unit-column-title">Đơn vị</span>,

      dataIndex: "unit",
      width: 180,

      filterMultiple: true,

      /*
       * Class này được gắn vào
       * dropdown portal của AntD.
       */
      filterDropdownProps: {
        className: "order-table__unit-filter-overlay",

        onOpenChange: (open) => {
          if (!open) {
            setUnitKeyword("");
          }
        },
      },

      /*
       * Custom icon nhỏ hơn icon
       * mặc định của AntD.
       */
      filterIcon: (filtered) => (
        <FilterFilled
          className={[
            "order-table__filter-icon",

            filtered ? "order-table__filter-icon--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ),

      /*
       * Custom dropdown hoàn toàn.
       */
      filterDropdown: ({ selectedKeys, setSelectedKeys, confirm }) => {
        const selected = selectedKeys || [];

        const selectedSet = new Set(selected);

        const hasVisibleOptions = filteredUnitOptions.length > 0;

        const allVisibleSelected =
          hasVisibleOptions &&
          filteredUnitOptions.every((unit) => selectedSet.has(unit));

        const handleToggleUnit = (unit, checked) => {
          if (checked) {
            setSelectedKeys(Array.from(new Set([...selected, unit])));

            return;
          }

          setSelectedKeys(selected.filter((item) => item !== unit));
        };

        /*
         * Chọn/bỏ chọn tất cả
         * kết quả ĐANG HIỂN THỊ.
         *
         * Nếu đang search "HD",
         * chỉ tác động các kết quả HD.
         */
        const handleToggleVisible = () => {
          if (!hasVisibleOptions) {
            return;
          }

          if (allVisibleSelected) {
            const visibleSet = new Set(filteredUnitOptions);

            setSelectedKeys(selected.filter((unit) => !visibleSet.has(unit)));

            return;
          }

          setSelectedKeys(
            Array.from(new Set([...selected, ...filteredUnitOptions])),
          );
        };

        const handleReset = () => {
          setSelectedKeys([]);
          setUnitKeyword("");
        };

        const handleApply = () => {
          confirm();

          setUnitKeyword("");
        };

        return (
          <div className="order-table__unit-filter">
            {/* Search */}

            <div className="order-table__unit-filter-search">
              <SearchInput
                size="md"
                allowClear
                autoFocus
                value={unitKeyword}
                placeholder="Tìm theo tên đơn vị..."
                onChange={(event) => setUnitKeyword(event.target.value)}
                onPressEnter={handleApply}
              />
            </div>

            {/* Meta */}

            <div className="order-table__unit-filter-meta">
              <span className="order-table__unit-filter-result">
                {unitKeyword
                  ? `${filteredUnitOptions.length} kết quả`
                  : `${normalizedUnitOptions.length} đơn vị`}
              </span>

              <Button
                type="link"
                size="small"
                disabled={!hasVisibleOptions}
                className="order-table__unit-filter-select-all"
                onClick={handleToggleVisible}
              >
                {allVisibleSelected ? "Bỏ chọn kết quả" : "Chọn tất cả kết quả"}
              </Button>
            </div>

            {/* List */}

            <div className="order-table__unit-filter-list">
              {hasVisibleOptions ? (
                filteredUnitOptions.map((unit) => {
                  const isSelected = selectedSet.has(unit);

                  return (
                    <label
                      key={unit}
                      className={[
                        "order-table__unit-filter-item",

                        isSelected
                          ? "order-table__unit-filter-item--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) =>
                          handleToggleUnit(unit, event.target.checked)
                        }
                      />

                      <span className="order-table__unit-filter-label">
                        {unit}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="order-table__unit-filter-empty">
                  <div className="order-table__unit-filter-empty-icon">
                    <SearchOutlined />
                  </div>

                  <div className="order-table__unit-filter-empty-title">
                    Không tìm thấy đơn vị phù hợp
                  </div>

                  <div className="order-table__unit-filter-empty-description">
                    Thử tìm bằng từ khóa khác
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="order-table__unit-filter-footer">
              <div className="order-table__unit-filter-selected">
                {selected.length > 0 ? (
                  <>
                    Đã chọn <strong>{selected.length}</strong>
                  </>
                ) : (
                  "Chưa chọn đơn vị"
                )}
              </div>

              <div className="order-table__unit-filter-actions">
                <Button
                  type="text"
                  disabled={selected.length === 0}
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>

                <Button type="primary" onClick={handleApply}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        );
      },

      onFilter: (value, record) => record.unit === value,

      render: (text) => (
        <span className="order-table__unit">
          {text?.trim() ? text : "Chưa cập nhật"}
        </span>
      ),
    },

    {
      title: "Khách hàng",
      dataIndex: "agencyOrderName",
      width: 160,

      render: (value) => (
        <span className="order-table__customer">
          {value?.trim() ? value : "Chưa cập nhật"}
        </span>
      ),
    },

    /* ======================================
       Address
    ====================================== */

    {
      title: "Địa chỉ",
      dataIndex: "address",
      width: 300,
      className: "order-table__address-cell",

      ellipsis: {
        showTitle: false,
      },

      render: (text) => {
        const address = text?.trim() ? text : "Chưa cập nhật";

        return (
          <Tooltip title={address} placement="topLeft">
            <span className="order-table__address">{address}</span>
          </Tooltip>
        );
      },
    },

    /* ======================================
       Phone
    ====================================== */

    {
      title: "Số điện thoại",
      dataIndex: "agencyOrderPhone",
      width: 130,

      render: (value) => (
        <span className="order-table__phone">
          {value ? formatPhoneNumberWithRegion(value) : "Chưa cập nhật"}
        </span>
      ),
    },

    /* ======================================
       Date
    ====================================== */

    {
      title: "Ngày đặt hàng",

      dataIndex: "dateTime",

      width: 140,

      render: (value) => (
        <span className="order-table__date">
          {dayjs(value).format("DD/MM/YYYY")}
        </span>
      ),

      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),

      defaultSortOrder: "descend",
    },

    /* ======================================
       Quantity
    ====================================== */

    {
      title: "Số suất ăn",
      key: "totalItems",
      width: 130,
      align: "center",

      render: (_, order) => (
        <span className="order-table__quantity">
          {getOrderTotalItems(order)}
        </span>
      ),
    },
  ];

  /* ========================================
     Render
  ======================================== */

  return (
    <Table
      className="order-table"
      columns={columns}
      dataSource={data}
      rowKey="orderId"
      loading={{
        spinning: loading,
      }}
      pagination={{
        current: currentPage,

        pageSize: PAGE_SIZE,

        showSizeChanger: false,

        hideOnSinglePage: true,

        onChange: onPageChange,
      }}
      tableLayout="fixed"
      scroll={{
        y: "100%",
      }}
      /*
       * Filter làm thay đổi số record,
       * nên luôn quay về page 1.
       */
      onChange={(_pagination, _filters, _sorter, extra) => {
        if (extra.action === "filter" && currentPage !== 1) {
          onPageChange(1);
        }
      }}
      onRow={(record) => ({
        onClick: () => onDetail(record),

        className: "order-table__row",
      })}
      locale={{
        emptyText: (
          <div className="order-table__empty">
            <EmptyState
              image="simple"
              description={
                <div className="order-table__empty-content">
                  <div className="order-table__empty-title">{emptyMessage}</div>

                  <div className="order-table__empty-description">
                    Danh sách sẽ tự cập nhật khi có đơn phù hợp.
                  </div>
                </div>
              }
            />
          </div>
        ),
      }}
    />
  );
}

OrderTable.propTypes = {
  data: PropTypes.array.isRequired,

  loading: PropTypes.bool,

  unitOptions: PropTypes.array.isRequired,

  onDetail: PropTypes.func.isRequired,

  emptyMessage: PropTypes.string,

  currentPage: PropTypes.number.isRequired,

  onPageChange: PropTypes.func.isRequired,
};

export default OrderTable;
