import React from "react";

import PropTypes from "prop-types";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppSelect from "../../../../shared/components/AppSelect";

import SearchInput from "../../../../shared/components/SearchInput";

import "./OrderHeader.scss";

function OrderHeader({
  title,
  kitchens,
  selectedKitchen,
  handleKitchenSelect,
  isSearch,
  searchValue,
  onSearch,
}) {
  const selectedKitchenValue =
    kitchens.find(
      (kitchen) =>
        kitchen.value === selectedKitchen || kitchen.label === selectedKitchen,
    )?.value ?? selectedKitchen;

  return (
    <ManagementPageHeader
      className="order-header"
      title={title}
      actions={
        <>
          {isSearch ? (
            <SearchInput
              size="lg"
              allowClear
              value={searchValue}
              placeholder="Tìm kiếm đơn hàng..."
              className="order-header__search"
              onChange={(event) => onSearch?.(event.target.value)}
            />
          ) : null}

          {kitchens.length > 0 ? (
            <AppSelect
              size="lg"
              value={selectedKitchenValue}
              options={kitchens}
              width={260}
              className="order-header__kitchen"
              placeholder="Chọn bếp"
              onChange={handleKitchenSelect}
            />
          ) : null}
        </>
      }
    />
  );
}

OrderHeader.propTypes = {
  title: PropTypes.string,

  kitchens: PropTypes.array,

  selectedKitchen: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  handleKitchenSelect: PropTypes.func,

  isSearch: PropTypes.bool,

  searchValue: PropTypes.string,

  onSearch: PropTypes.func,
};

OrderHeader.defaultProps = {
  title: "Danh sách đơn hàng",

  kitchens: [],

  selectedKitchen: undefined,

  handleKitchenSelect: undefined,

  isSearch: false,

  searchValue: "",

  onSearch: undefined,
};

export default OrderHeader;
