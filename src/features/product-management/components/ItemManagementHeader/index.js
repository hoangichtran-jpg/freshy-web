import React from "react";

import PropTypes from "prop-types";

import { PlusOutlined } from "@ant-design/icons";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import "../../styles/productManagementControls.scss";

import SearchInput from "../../../../shared/components/SearchInput";

function ItemManagementHeader({
  searchValue,
  onSearchChange,
  onCreate,
}) {
  return (
    <ManagementPageHeader
      title="Danh sách món ăn"
      description="Quản lý món ăn, giá bán và nhóm topping đi kèm."
      actions={
        <>
          <SearchInput
            size="lg"
            allowClear
            value={searchValue}
            placeholder="Tìm món ăn..."
            className="product-management-search"
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
          />

          <AppButton
            icon={
              <PlusOutlined />
            }
            onClick={onCreate}
          >
            Thêm món ăn
          </AppButton>
        </>
      }
    />
  );
}


ItemManagementHeader.propTypes = {
  searchValue:
    PropTypes.string,

  onSearchChange:
    PropTypes.func.isRequired,

  onCreate:
    PropTypes.func.isRequired,
};


ItemManagementHeader.defaultProps = {
  searchValue: "",
};


export default ItemManagementHeader;
