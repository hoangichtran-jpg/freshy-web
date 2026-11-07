import React from "react";

import {
  AppstoreOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  HomeOutlined,
  MessageOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import config from "../../../config";

export const APP_NAVIGATION = {
  /* ========================================
     Home
  ======================================== */

  home: {
    title: "Trang chủ",

    path: config.routes.home,

    icon: <HomeOutlined />,
  },

  /* ========================================
     Management
  ======================================== */

  management: {
    title: "Quản lý",

    icon: <AppstoreOutlined />,

    subMenu: [
      /* ========================================
         Kitchen / POS
      ======================================== */

      {
        title: "Quản lý trung tâm",

        icon: <ShopOutlined />,

        children: [
          {
            title: "Danh sách bếp",

            path: config.routes.manage_pos,
          },

          {
            title: "Thực đơn bếp",

            path: config.routes.manage_menu,
          },

          {
            title: "Danh sách địa chỉ",

            path: config.routes.manage_pos_address,
          },
        ],
      },

      /* ========================================
         Users
      ======================================== */

      {
        title: "Quản lý người dùng",

        icon: <TeamOutlined />,

        children: [
          {
            title: "Quản lý đại lý",

            path: config.routes.manage_agency,
          },

          {
            title: "Quản lý giao hàng",

            path: config.routes.manage_shipper,
          },
        ],
      },

      /* ========================================
         Address
      ======================================== */

      {
        title: "Quản lý địa chỉ",

        path: config.routes.manage_address,

        icon: <EnvironmentOutlined />,
      },

      /* ========================================
         Products
      ======================================== */

      {
        title: "Quản lý sản phẩm",

        icon: <AppstoreOutlined />,

        children: [
          {
            title: "Danh sách thực đơn",

            path: config.routes.group_menu,
          },

          {
            title: "Danh sách món ăn",

            path: config.routes.item_menu,
          },

          {
            title: "Danh sách topping",

            path: config.routes.topping_menu,
          },
        ],
      },

      /* ========================================
         Registration
      ======================================== */

      {
        title: "Đăng ký người dùng",

        icon: <UserAddOutlined />,

        children: [
          {
            title: "Đăng ký đại lý",

            path: config.routes.register_agency,
          },

          {
            title: "Đăng ký giao hàng",

            path: config.routes.register_shipper,
          },
        ],
      },
    ],
  },

  /* ========================================
     Sales
  ======================================== */

  orders: {
    title: "Quản lý bán hàng",

    icon: <ShoppingCartOutlined />,

    subMenu: [
      {
        title: "Danh sách đơn hàng",

        path: config.routes.order_tabs,

        icon: <ShoppingCartOutlined />,
      },

      {
        title: "Doanh số bán hàng",

        path: config.routes.order_summary,

        icon: <BarChartOutlined />,
      },
    ],
  },

  /* ========================================
     Customer service
  ======================================== */

  customerService: {
    title: "Dịch vụ khách hàng",

    icon: <CustomerServiceOutlined />,

    subMenu: [
      /*
       * Hai nghiệp vụ liên quan trực tiếp
       * đến trải nghiệm của khách hàng
       * được gom vào cùng một nhóm.
       */
      {
        title: "Trải nghiệm khách hàng",

        icon: <CustomerServiceOutlined />,

        children: [
          {
            title: "Chất lượng dịch vụ",

            path: config.routes.manage_request_rate,

            icon: <SafetyCertificateOutlined />,
          },

          {
            title: "Hỗ trợ khách hàng",

            path: config.routes.customer_care,

            icon: <MessageOutlined />,
          },
        ],
      },

      /* ========================================
         Marketing
      ======================================== */

      {
        title: "Quảng cáo",

        path: config.routes.marketing,

        icon: <PictureOutlined />,
      },
    ],
  },

  /* ========================================
     Reports
  ======================================== */

  reports: {
    title: "Báo cáo",

    icon: <BarChartOutlined />,

    subMenu: [
      {
        title: "Tổng hợp đơn hàng",

        path: "/manager-order-summary",

        icon: <FileDoneOutlined />,
      },
    ],
  },
};
