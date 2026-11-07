import React from "react";

import PropTypes from "prop-types";

import { PlusOutlined } from "@ant-design/icons";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import "../../styles/productManagementControls.scss";

import SearchInput from "../../../../shared/components/SearchInput";

function MenuManagementHeader({
  searchValue,
  onSearchChange,
  onCreate,
}) {
  return (
    <ManagementPageHeader
      title="Danh sách thực đơn"
      description="Tạo và quản lý các thực đơn dùng cho hệ thống Freshy."
      actions={
        <>
          <SearchInput
            size="lg"
            allowClear
            value={searchValue}
            placeholder="Tìm thực đơn..."
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
            Tạo thực đơn
          </AppButton>
        </>
      }
    />
  );
}


MenuManagementHeader.propTypes = {
  searchValue:
    PropTypes.string,

  onSearchChange:
    PropTypes.func.isRequired,

  onCreate:
    PropTypes.func.isRequired,
};


MenuManagementHeader.defaultProps = {
  searchValue: "",
};


export default MenuManagementHeader;
