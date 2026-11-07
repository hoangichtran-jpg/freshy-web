import React from "react";
import PropTypes from "prop-types";
import { Tabs } from "antd";

import { ORDER_TABS } from "../../constants/order.constants";

import "./OrderStatusTabs.scss";

function OrderStatusTabs({
  activeTab,
  onChange,
  counts,
}) {
  return (
    <div className="order-status-tabs">
      <Tabs
        activeKey={String(activeTab)}
        onChange={(key) =>
          onChange(Number(key))
        }
        items={ORDER_TABS.map(
          (tab, index) => {
            const count =
              counts?.[tab.status];

            return {
              key: String(index),

              label: (
                <span className="order-status-tabs__label">
                  <span>{tab.label}</span>

                  {count !== null &&
                    count !== undefined && (
                      <span className="order-status-tabs__count">
                        {count}
                      </span>
                    )}
                </span>
              ),
            };
          },
        )}
      />
    </div>
  );
}

OrderStatusTabs.propTypes = {
  activeTab: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  counts: PropTypes.object,
};

export default OrderStatusTabs;