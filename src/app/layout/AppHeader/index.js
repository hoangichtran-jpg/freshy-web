import { useEffect, useState } from "react";

import PropTypes from "prop-types";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Button,
  Drawer,
  Image,
  Menu,
  Tabs,
} from "antd";

import { MenuOutlined } from "@ant-design/icons";

import { useAuth } from "../../../shared/auth";

import { getUserInfo } from "../../../shared/api/account.api";

import { useLogout } from "../../../features/auth";

import toast from "../../../shared/components/AppToast";

import images from "../../../assets/images";

import config from "../../../config";

import { APP_NAVIGATION } from "../navigation/appNavigation";

import ProfileDrawer from "./components/ProfileDrawer";


import "./AppHeader.scss";

/* ========================================
   Navigation
======================================== */

const NAVIGATION_ITEMS = Object.entries(APP_NAVIGATION).map(
  ([key, { title, icon }]) => ({
    key,

    label: (
      <span className="app-header__nav-label">
        {icon}

        <span>{title}</span>
      </span>
    ),
  }),
);

/* ========================================
   Mobile navigation
======================================== */

const MOBILE_NAVIGATION_ITEMS = Object.entries(APP_NAVIGATION).map(
  ([tabKey, tab]) => {
    if (tab.path) {
      return {
        key: tab.path,
        label: tab.title,
        icon: tab.icon,
      };
    }

    return {
      key: `section:${tabKey}`,
      label: tab.title,
      icon: tab.icon,
      children: (tab.subMenu || []).map((menu, menuIndex) => {
        if (menu.children?.length) {
          return {
            key: `section:${tabKey}:group:${menuIndex}`,
            label: menu.title,
            icon: menu.icon,
            children: menu.children.map((child) => ({
              key: child.path,
              label: child.title,
              icon: child.icon,
            })),
          };
        }

        return {
          key: menu.path || `section:${tabKey}:item:${menuIndex}`,
          label: menu.title,
          icon: menu.icon,
        };
      }),
    };
  },
);

const getMobileOpenKeys = (currentTab, pathname) => {
  const openKeys = [`section:${currentTab}`];

  const currentNavigation = APP_NAVIGATION[currentTab];

  currentNavigation?.subMenu?.forEach((menu, menuIndex) => {
    if (menu.children?.some((child) => child.path === pathname)) {
      openKeys.push(`section:${currentTab}:group:${menuIndex}`);
    }
  });

  return openKeys;
};

/* ========================================
   Header
======================================== */

function AppHeader({ currentTab }) {
  /* ========================================
     Auth
  ======================================== */

  const {
    userAuth,

    tokenStr,

    setOpenFormLogin,
  } = useAuth();

  const { logout } = useLogout();

  const navigate = useNavigate();

  const location = useLocation();

  /* ========================================
     User identity
  ======================================== */

  const phoneNumber = userAuth?.userPhone;

  const role = userAuth?.userRoles?.includes("ROLE_SUPER_ADMIN")
    ? "ROLE_SUPER_ADMIN"
    : userAuth?.userRoles?.includes("ROLE_ADMIN")
      ? "ROLE_ADMIN"
      : null;

  /* ========================================
     State
  ======================================== */

  const [userData, setUserData] = useState({});

  const [previewAvatar, setPreviewAvatar] = useState(images.defaultAvatar);

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  /* ========================================
     Auth derived
  ======================================== */

  const isAuthenticated = Boolean(tokenStr && userAuth);

  /* ========================================
     User profile
  ======================================== */

  useEffect(() => {
    if (!phoneNumber || !role) {
      setUserData({});

      setPreviewAvatar(images.defaultAvatar);

      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await getUserInfo(phoneNumber, role);

        const nextUserData = response || {};

        setUserData(nextUserData);

        setPreviewAvatar(nextUserData.imagePath || images.defaultAvatar);
      } catch (error) {
        console.error("Failed to fetch user data:", error);

        toast.error({
          message: "Không thể tải hồ sơ",

          description: "Không thể tải thông tin tài khoản.",
        });
      }
    };

    fetchUserData();
  }, [phoneNumber, role]);

  /* ========================================
     Navigation
  ======================================== */

  const handleTabChange = (key) => {
    const selectedTab = APP_NAVIGATION[key];

    if (!selectedTab) {
      return;
    }

    /* ========================================
         Module with sidebar
      ======================================== */

    if (selectedTab.subMenu?.length) {
      const firstMenu = selectedTab.subMenu[0];

      const firstPath = firstMenu.path || firstMenu.children?.[0]?.path;

      if (firstPath) {
        navigate(firstPath);
      }

      return;
    }

    /* ========================================
         Direct module
      ======================================== */

    if (selectedTab.path) {
      navigate(selectedTab.path);
    }
  };

  /* ========================================
     Login
  ======================================== */

  const handleOpenLogin = () => {
    setOpenFormLogin(true);
  };

  /* ========================================
     Logout
  ======================================== */

  const handleLogout = () => {
    logout();

    setIsProfileDrawerOpen(false);

    setIsMobileNavigationOpen(false);

    navigate(config.routes.home, {
      replace: true,
    });

    toast.success({
      title: "Đăng xuất thành công",

      description: "Phiên đăng nhập đã được kết thúc.",
    });
  };

  /* ========================================
     Mobile navigation
  ======================================== */

  const handleMobileNavigationClick = ({ key }) => {
    if (!key || key.startsWith("section:")) {
      return;
    }

    navigate(key);

    setIsMobileNavigationOpen(false);
  };

  /* ========================================
     Display
  ======================================== */

  const displayName =
    userData?.lastName ||
    userData?.firstName ||
    userAuth?.userName ||
    "Tài khoản";

  /* ========================================
     Render
  ======================================== */

  return (
    <>
      <header className="app-header">
        {/* ========================================
            Brand
        ======================================== */}

        <div className="app-header__brand">
          {isAuthenticated ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="app-header__mobile-menu"
              aria-label="Mở điều hướng"
              aria-expanded={isMobileNavigationOpen}
              onClick={() => {
                setIsMobileNavigationOpen(true);
              }}
            />
          ) : null}

          <Link to={config.routes.home} className="app-header__logo">
            <Image
              preview={false}
              src={images.nameApp}
              alt="Freshy"
              className="app-header__logo-name"
            />
          </Link>
        </div>

        {/* ========================================
            Navigation
        ======================================== */}

        {isAuthenticated ? (
          <nav className="app-header__navigation">
            <Tabs
              activeKey={currentTab}
              onChange={handleTabChange}
              items={NAVIGATION_ITEMS}
            />
          </nav>
        ) : null}

        {/* ========================================
            Actions
        ======================================== */}

        <div className="app-header__actions">
          {!isAuthenticated ? (
            <div className="app-header__auth">
              <Button type="primary" onClick={handleOpenLogin}>
                Đăng nhập
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="app-header__profile"
                onClick={() => {
                  setIsProfileDrawerOpen(true);
                }}
              >
                <img
                  src={previewAvatar}
                  alt="Ảnh đại diện"
                  className="app-header__avatar"
                />

                <span className="app-header__profile-name">{displayName}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ========================================
          Authenticated overlays

          Chỉ mount khi authenticated.
          Logout sẽ unmount ngay cả confirm
          state bên trong ProfileDrawer.
      ======================================== */}

      {isAuthenticated ? (
        <>
          <ProfileDrawer
            visible={isProfileDrawerOpen}
            userAuth={userAuth}
            userData={userData}
            previewAvatar={previewAvatar}
            onClose={() => {
              setIsProfileDrawerOpen(false);
            }}
            onLogout={handleLogout}
            onProfileUpdated={setUserData}
            onPreviewAvatarChange={setPreviewAvatar}
          />

          <Drawer
            title="Điều hướng"
            placement="left"
            width={300}
            open={isMobileNavigationOpen}
            onClose={() => {
              setIsMobileNavigationOpen(false);
            }}
            className="app-header__mobile-drawer"
            zIndex={1200}
          >
            <Menu
              key={`${currentTab}-${location.pathname}`}
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={getMobileOpenKeys(
                currentTab,
                location.pathname,
              )}
              items={MOBILE_NAVIGATION_ITEMS}
              onClick={handleMobileNavigationClick}
            />
          </Drawer>
        </>
      ) : null}
    </>
  );
}

AppHeader.propTypes = {
  currentTab: PropTypes.string.isRequired,
};

export default AppHeader;
