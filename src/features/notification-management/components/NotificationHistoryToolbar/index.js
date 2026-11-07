import React from "react";

import PropTypes from "prop-types";

import { InfoCircleOutlined } from "@ant-design/icons";

import SearchInput from "../../../../shared/components/SearchInput";

import "./NotificationHistoryToolbar.scss";

function NotificationHistoryToolbar({
  searchValue,

  onSearchChange,
}) {
  return (
    <div className="notification-history-toolbar">
      {/* ========================================
          Search
      ======================================== */}

      <div className="notification-history-toolbar__search">
        <SearchInput
          size="md"
          allowClear
          value={searchValue}
          placeholder="Tìm theo tiêu đề, nội dung hoặc nhóm người nhận..."
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
        />
      </div>

      {/* ========================================
          Data source disclosure
      ======================================== */}

      <div className="notification-history-toolbar__source">
        <InfoCircleOutlined />

        <span>Lịch sử trên trình duyệt này</span>
      </div>
    </div>
  );
}

NotificationHistoryToolbar.propTypes = {
  searchValue: PropTypes.string,

  onSearchChange: PropTypes.func.isRequired,
};

NotificationHistoryToolbar.defaultProps = {
  searchValue: "",
};

export default NotificationHistoryToolbar;
