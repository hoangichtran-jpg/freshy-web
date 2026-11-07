import { HomePage } from "../../features/home";

import { PosManagementPage } from "../../features/pos-management";

import { KitchenMenuPage } from "../../features/kitchen-menu/pages";

import {
  ItemManagementPage,
  MenuManagementPage,
  ToppingManagementPage,
} from "../../features/product-management";

import {
  AgencyRegistrationPage,
  ShipperRegistrationPage,
} from "../../features/user-registration";

import {
  AgencyManagementPage,
  ShipperManagementPage,
} from "../../features/user-management";

import {
  AddressManagementPage,
  PosAddressManagementPage,
} from "../../features/address-management";

import { MarketingPage } from "../../features/marketing";

import { ServiceQualityPage } from "../../features/service-quality";

import { NotificationManagementPage } from "../../features/notification-management";

import OrdersPage from "../../features/orders/pages/OrdersPage";

import OrderSummaryPage from "../../features/order-summary/pages/OrderSummaryPage";

import SalesSummaryPage from "../../features/sales/pages/SalesSummaryPage";

import config from "../../config";

/* ========================================
   Public routes
======================================== */

const publicRoutes = [
  {
    path: config.routes.home,

    component: HomePage,
  },
];

/* ========================================
   Private routes
======================================== */

const privateRoutes = [
  /* ========================================
     Kitchen / POS
  ======================================== */

  {
    path: config.routes.manage_pos,

    component: PosManagementPage,
  },

  {
    path: config.routes.manage_menu,

    component: KitchenMenuPage,
  },

  {
    path: config.routes.manage_pos_address,

    component: PosAddressManagementPage,
  },

  /* ========================================
     User management
  ======================================== */

  {
    path: config.routes.manage_agency,

    component: AgencyManagementPage,
  },

  {
    path: config.routes.manage_shipper,

    component: ShipperManagementPage,
  },

  {
    path: config.routes.register_agency,

    component: AgencyRegistrationPage,
  },

  {
    path: config.routes.register_shipper,

    component: ShipperRegistrationPage,
  },

  /* ========================================
     Address
  ======================================== */

  {
    path: config.routes.manage_address,

    component: AddressManagementPage,
  },

  /* ========================================
     Product
  ======================================== */

  {
    path: config.routes.group_menu,

    component: MenuManagementPage,
  },

  {
    path: config.routes.item_menu,

    component: ItemManagementPage,
  },

  {
    path: config.routes.topping_menu,

    component: ToppingManagementPage,
  },

  /* ========================================
     Orders / Sales
  ======================================== */

  {
    path: config.routes.order_tabs,

    component: OrdersPage,
  },

  {
    path: config.routes.order_summary,

    component: SalesSummaryPage,
  },

  /* ========================================
     Customer service
  ======================================== */

  {
    path: config.routes.manage_request_rate,

    component: ServiceQualityPage,
  },

  {
    path: config.routes.customer_care,

    component: NotificationManagementPage,
  },

  {
    path: config.routes.marketing,

    component: MarketingPage,
  },

  /* ========================================
     Reports
  ======================================== */

  {
    path: config.routes.manage_order_summary,

    component: OrderSummaryPage,
  },
];

export { publicRoutes, privateRoutes };
