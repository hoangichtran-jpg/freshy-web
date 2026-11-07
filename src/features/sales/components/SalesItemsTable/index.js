import PropTypes from "prop-types";

import {
  Table,
} from "antd";

import EmptyState from "../../../../shared/components/EmptyState";

import "./SalesItemsTable.scss";



const formatNumber = (value) => {
  return Number(
    value ?? 0,
  ).toLocaleString("vi-VN");
};


const getSoldQuantity = (
  record,
) => {
  const initial =
    Number(
      record.quantityInitial ??
        0,
    );

  const remaining =
    Number(
      record.quantity ??
        0,
    );


  return Math.max(
    0,
    initial - remaining,
  );
};


const columns = [
  {
    title:
      "Tên món ăn",

    dataIndex:
      "itemName",

    key:
      "itemName",

    width:
      260,

    ellipsis:
      true,

    render: (
      value,
    ) => (
      <span className="sales-items-table__item-name">
        {value || "—"}
      </span>
    ),
  },

  {
    title:
      "Ban đầu",

    dataIndex:
      "quantityInitial",

    key:
      "quantityInitial",

    width:
      120,

    align:
      "right",

    render: (
      value,
    ) => (
      <span className="sales-items-table__number">
        {formatNumber(
          value,
        )}
      </span>
    ),
  },

  {
    title:
      "Đã bán",

    key:
      "sold",

    width:
      120,

    align:
      "right",

    render: (
      _,
      record,
    ) => (
      <span className="sales-items-table__number sales-items-table__number--sold">
        {formatNumber(
          getSoldQuantity(
            record,
          ),
        )}
      </span>
    ),
  },

  {
    title:
      "Tổng món",

    dataIndex:
      "totalItem",

    key:
      "totalItem",

    width:
      120,

    align:
      "right",

    render: (
      value,
    ) => (
      <span className="sales-items-table__number">
        {formatNumber(
          value,
        )}
      </span>
    ),
  },

  {
    title:
      "Topping",

    dataIndex:
      "totalTopping",

    key:
      "totalTopping",

    width:
      110,

    align:
      "right",

    render: (
      value,
    ) => (
      <span className="sales-items-table__number sales-items-table__number--muted">
        {formatNumber(
          value,
        )}
      </span>
    ),
  },

  {
    title:
      "Còn lại",

    dataIndex:
      "quantity",

    key:
      "quantity",

    width:
      120,

    align:
      "right",

    render: (
      value,
    ) => (
      <strong className="sales-items-table__remaining-value">
        {formatNumber(
          value,
        )}
      </strong>
    ),
  },
];


function SalesItemsTable({
  items,
}) {
  return (
    <section className="sales-items-table">
      <div className="sales-items-table__header">
        <div className="sales-items-table__heading">
          <h3 className="sales-items-table__title">
            Chi tiết món trong ca
          </h3>

          <p className="sales-items-table__description">
            Theo dõi định lượng và số lượng bán của từng món.
          </p>
        </div>


        <span className="sales-items-table__count">
          {items.length} món
        </span>
      </div>


      <div className="sales-items-table__table">
        <Table
          dataSource={
            items
          }

          columns={
            columns
          }

          pagination={
            false
          }

          size="middle"

          tableLayout="fixed"

          rowKey={(
            record,
          ) =>
            record.menuItemId ||
            record.itemId ||
            record.itemName
          }

          scroll={{
            x: 850,
            y: 9999,
          }}

          locale={{
            emptyText: (
              <EmptyState
                image="simple"

                description="Chưa có món ăn trong ca"
              />
            ),
          }}
        />
      </div>
    </section>
  );
}


SalesItemsTable.propTypes = {
  items:
    PropTypes.array.isRequired,
};


export default SalesItemsTable;
