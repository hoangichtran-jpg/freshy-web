import React from "react";

import PropTypes from "prop-types";

import SearchInput from "../../../../shared/components/SearchInput";

import "./ServiceQualityToolbar.scss";

function ServiceQualityToolbar({
  searchValue,

  filteredCount,
  totalCount,

  onSearchChange,
}) {
  const hasSearch = Boolean(searchValue.trim());

  const displayCount = hasSearch ? filteredCount : totalCount;

  return (
    <div className="service-quality-toolbar">
      {/* ========================================
          Search
      ======================================== */}

      <div className="service-quality-toolbar__search">
        <SearchInput
          size="md"
          allowClear
          value={searchValue}
          placeholder="Tìm theo SĐT hoặc nội dung phản hồi..."
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
        />
      </div>

      {/* ========================================
          Result count
      ======================================== */}

      <div className="service-quality-toolbar__meta">
        <strong>{displayCount}</strong>

        <span>{hasSearch ? "kết quả" : "đánh giá"}</span>
      </div>
    </div>
  );
}

ServiceQualityToolbar.propTypes = {
  searchValue: PropTypes.string,

  filteredCount: PropTypes.number,

  totalCount: PropTypes.number,

  onSearchChange: PropTypes.func.isRequired,
};

ServiceQualityToolbar.defaultProps = {
  searchValue: "",

  filteredCount: 0,

  totalCount: 0,
};

export default ServiceQualityToolbar;
