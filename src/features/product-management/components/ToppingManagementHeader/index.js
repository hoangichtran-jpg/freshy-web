import React from "react";

import PropTypes from "prop-types";

import { PlusOutlined } from "@ant-design/icons";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import "../../styles/productManagementControls.scss";

import SearchInput from "../../../../shared/components/SearchInput";

function ToppingManagementHeader({
  searchValue,
  onSearchChange,
  onCreate,
}) {
  return (
    <ManagementPageHeader
      title="Danh sách nhóm topping"
      description="Quản lý nhóm topping, giới hạn lựa chọn và các topping đi kèm."
      actions={
        <>
          <SearchInput
            size="lg"
            allowClear
            value={searchValue}
            placeholder="Tìm nhóm topping..."
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
            Thêm nhóm topping
          </AppButton>
        </>
      }
    />
  );
}


ToppingManagementHeader.propTypes = {
  searchValue:
    PropTypes.string,

  onSearchChange:
    PropTypes.func.isRequired,

  onCreate:
    PropTypes.func.isRequired,
};


ToppingManagementHeader.defaultProps = {
  searchValue: "",
};


export default ToppingManagementHeader;
