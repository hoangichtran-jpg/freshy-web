import React from "react";
import PropTypes from "prop-types";

import { Table } from "antd";

import "./ManagementTable.scss";


function ManagementTable({
  className,
  columns,
  dataSource,
  rowKey,
  loading,
  pagination,
  scroll,
  locale,
  onChange,
  ...rest
}) {
  const rootClassName = [
    "management-table",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <Table
        {...rest}
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        locale={locale}
        tableLayout="fixed"
        showSorterTooltip={false}
        scroll={{
          ...scroll,
          y: scroll?.y ?? 9999,
        }}
        className="management-table__antd"
        onChange={onChange}
      />
    </div>
  );
}


ManagementTable.propTypes = {
  className: PropTypes.string,

  columns:
    PropTypes.arrayOf(
      PropTypes.object,
    ).isRequired,

  dataSource:
    PropTypes.arrayOf(
      PropTypes.object,
    ),

  rowKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),

  loading: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),

  pagination: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),

  scroll: PropTypes.object,

  locale: PropTypes.object,

  onChange: PropTypes.func,
};


ManagementTable.defaultProps = {
  className: "",
  dataSource: [],
  rowKey: "key",
  loading: false,
  pagination: false,
  scroll: {},
  locale: undefined,
  onChange: undefined,
};


export default ManagementTable;