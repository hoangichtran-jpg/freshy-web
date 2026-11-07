import PropTypes from "prop-types";

import { Button } from "antd";

import { HolderOutlined } from "@ant-design/icons";

import SearchInput from "../../../../shared/components/SearchInput";

import "./BannerToolbar.scss";

function BannerToolbar({
  searchValue,
  filteredCount,
  totalCount,

  reorderDisabled,

  onSearchChange,
  onReorder,
}) {
  const hasSearch = Boolean(searchValue.trim());

  const displayCount = hasSearch ? filteredCount : totalCount;

  return (
    <div className="banner-toolbar">
      {/* ========================================
          Search
      ======================================== */}

      <div className="banner-toolbar__search">
        <SearchInput
          size="md"
          allowClear
          value={searchValue}
          placeholder="Tìm theo tiêu đề..."
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
        />
      </div>

      {/* ========================================
          Right actions
      ======================================== */}

      <div className="banner-toolbar__right">
        <div className="banner-toolbar__meta">
          <strong>{displayCount}</strong>

          <span>{hasSearch ? "kết quả" : "quảng cáo"}</span>
        </div>

        <Button
          icon={<HolderOutlined />}
          disabled={reorderDisabled}
          className="banner-toolbar__reorder"
          onClick={onReorder}
        >
          Sắp xếp hiển thị
        </Button>
      </div>
    </div>
  );
}

/* ========================================
   PropTypes
======================================== */

BannerToolbar.propTypes = {
  searchValue: PropTypes.string,

  filteredCount: PropTypes.number,

  totalCount: PropTypes.number,

  reorderDisabled: PropTypes.bool,

  onSearchChange: PropTypes.func.isRequired,

  onReorder: PropTypes.func.isRequired,
};

BannerToolbar.defaultProps = {
  searchValue: "",

  filteredCount: 0,

  totalCount: 0,

  reorderDisabled: false,
};

export default BannerToolbar;
