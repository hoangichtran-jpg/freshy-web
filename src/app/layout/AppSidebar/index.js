import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Menu, Tooltip } from "antd";

import { RightOutlined } from "@ant-design/icons";

import "./AppSidebar.scss";

function AppSidebar({
  navigation,
  currentTab,
  currentSubMenu,
  collapsed,
  onCollapse,
  onNavigate,
}) {
  const [openKeys, setOpenKeys] = useState([]);

  const currentData = navigation[currentTab];

  /* ========================================
     Keep selected parent open
  ======================================== */

  useEffect(() => {
    if (collapsed || !currentData?.subMenu?.length || !currentSubMenu) {
      return;
    }

    const parentIndex = currentData.subMenu.findIndex((menu) =>
      menu.children?.some((child) => child.path === currentSubMenu),
    );

    if (parentIndex === -1) {
      return;
    }

    const parentKey = `menu-${parentIndex}`;

    if (openKeys.includes(parentKey)) {
      return;
    }

    setOpenKeys((previousKeys) => [...previousKeys, parentKey]);
  }, [collapsed, currentData, currentSubMenu, openKeys, setOpenKeys]);

  /* ========================================
     Menu items
  ======================================== */

  const menuItems = useMemo(() => {
    if (!currentData?.subMenu?.length) {
      return [];
    }

    return currentData.subMenu.map((menu, index) => {
      const parentKey = `menu-${index}`;

      /* ========================================
             Parent with children
          ======================================== */

      if (menu.children?.length) {
        return {
          key: parentKey,

          label: menu.title,

          icon: menu.icon,

          children: menu.children.map((child) => ({
            key: child.path,

            label: child.title,

            /*
             * Child icon là optional.
             *
             * Hiện tại Management cố tình
             * không dùng để giảm visual noise.
             *
             * Các feature khác nếu thực sự
             * cần vẫn có thể truyền icon.
             */
            icon: child.icon,

            /*
             * Giúp giữ tên accessible
             * và hữu ích khi menu thay đổi
             * presentation.
             */
            title: child.title,
          })),
        };
      }

      /* ========================================
             Single menu item
          ======================================== */

      return {
        key: menu.path || parentKey,

        label: menu.title,

        icon: menu.icon,

        /*
         * Ant Design có thể sử dụng title
         * cho collapsed menu item.
         */
        title: menu.title,
      };
    });
  }, [currentData]);

  /* ========================================
     Navigate
  ======================================== */

  const handleMenuClick = ({ key }) => {
    if (!key || key.startsWith("menu-")) {
      return;
    }

    onNavigate(key);
  };

  /* ========================================
     Collapse
  ======================================== */

  const handleCollapse = () => {
    onCollapse(!collapsed);
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <aside
      className={["app-sidebar", collapsed ? "app-sidebar--collapsed" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ========================================
          Navigation
      ======================================== */}

      <div id="app-sidebar-navigation" className="app-sidebar__menu">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={currentSubMenu ? [currentSubMenu] : []}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={collapsed ? undefined : setOpenKeys}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </div>

      {/* ========================================
          Collapse control
      ======================================== */}

      <div className="app-sidebar__collapse-dock">
        <Tooltip
          title={collapsed ? "Mở thanh điều hướng" : null}
          placement="right"
        >
          <Button
            type="text"
            className="app-sidebar__collapse"
            icon={collapsed ? <RightOutlined /> : null}
            aria-label={
              collapsed ? "Mở thanh điều hướng" : "Thu gọn thanh điều hướng"
            }
            aria-expanded={!collapsed}
            aria-controls="app-sidebar-navigation"
            onClick={handleCollapse}
          >
            {!collapsed && (
              <span className="app-sidebar__collapse-label">Đóng</span>
            )}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}

AppSidebar.propTypes = {
  navigation: PropTypes.object.isRequired,

  currentTab: PropTypes.string,

  currentSubMenu: PropTypes.string,

  collapsed: PropTypes.bool.isRequired,

  onCollapse: PropTypes.func.isRequired,

  onNavigate: PropTypes.func.isRequired,
};

AppSidebar.defaultProps = {
  currentTab: undefined,

  currentSubMenu: undefined,
};

export default AppSidebar;
