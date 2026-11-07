import { useCallback, useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import classNames from "classnames/bind";

import { useLocation, useNavigate } from "react-router-dom";

import styles from "./AppLayout.module.scss";

import {
  useAuth,
} from "../../../shared/auth";

import CookieConsent from "../../../components/CookieConsent";

import AppHeader from "../AppHeader";

import AppSidebar from "../AppSidebar";

import AuthModals from "../AuthModals";

import { APP_NAVIGATION } from "../navigation/appNavigation";

const cx = classNames.bind(styles);

/* ========================================
   Navigation state
======================================== */

const getNavigationState = (pathname) => {
  for (const [tabKey, tab] of Object.entries(APP_NAVIGATION)) {
    /* ========================================
       Direct tab route
    ======================================== */

    if (tab.path === pathname) {
      return {
        currentTab: tabKey,

        currentSubMenu: null,
      };
    }

    /* ========================================
       Sidebar route
    ======================================== */

    for (const menu of tab.subMenu || []) {
      if (menu.path === pathname) {
        return {
          currentTab: tabKey,

          currentSubMenu: menu.path,
        };
      }

      const matchedChild = menu.children?.find(
        (child) => child.path === pathname,
      );

      if (matchedChild) {
        return {
          currentTab: tabKey,

          currentSubMenu: matchedChild.path,
        };
      }
    }
  }

  /* ========================================
     Fallback
  ======================================== */

  return {
    currentTab: "home",

    currentSubMenu: null,
  };
};

/* ========================================
   Layout
======================================== */

function AppLayout({ children }) {
  /* ========================================
     Auth
  ======================================== */

  const {
    openFormLogin,

    setOpenFormLogin,
  } = useAuth();

  const handleCloseLogin = useCallback(() => {
    setOpenFormLogin(false);
  }, [setOpenFormLogin]);

  /* ========================================
     Router
  ======================================== */

  const navigate = useNavigate();

  const location = useLocation();

  /* ========================================
     Layout state
  ======================================== */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* ========================================
     Navigation state

     URL is source of truth.
  ======================================== */

  const {
    currentTab,

    currentSubMenu,
  } = useMemo(
    () => getNavigationState(location.pathname),

    [location.pathname],
  );

  const showSidebar = Boolean(APP_NAVIGATION[currentTab]?.subMenu?.length);

  /* ========================================
     Overlay state
  ======================================== */

  const isOverlayOpen = openFormLogin;

  /* ========================================
     Body scroll lock
  ======================================== */

  useEffect(() => {
    document.body.style.overflowY = isOverlayOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isOverlayOpen]);

  /* ========================================
     Render
  ======================================== */

  return (
    <div className={cx("app-layout")}>
      <CookieConsent />

      <AuthModals
        openFormLogin={openFormLogin}
        onCloseLogin={handleCloseLogin}
      />

      <AppHeader currentTab={currentTab} />

      <div className={cx("app-main")}>
        {showSidebar ? (
          <AppSidebar
            navigation={APP_NAVIGATION}
            currentTab={currentTab}
            currentSubMenu={currentSubMenu}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            onNavigate={(path) => {
              navigate(path);
            }}
          />
        ) : null}

        <main
          className={cx("app-content")}
          style={{
            marginLeft: showSidebar
              ? sidebarCollapsed
                ? "var(--app-sidebar-collapsed-width)"
                : "var(--app-sidebar-width)"
              : 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;
