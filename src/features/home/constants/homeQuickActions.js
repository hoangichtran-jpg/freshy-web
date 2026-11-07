import {
  BarChartOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";



import config from "../../../config";

export const HOME_QUICK_ACTIONS = [
  {
    key: "orders",
    title: "Đơn hàng",
    description: "Theo dõi và xử lý đơn đang vận hành.",
    path: config.routes.order_tabs,
    icon: ShoppingCartOutlined,
    tone: "primary",
  },
  {
    key: "kitchen-menu",
    title: "Thực đơn bếp",
    description: "Kiểm tra thực đơn đang áp dụng tại bếp.",
    path: config.routes.manage_menu,
    icon: ShopOutlined,
    tone: "secondary",
  },
  {
    key: "menus",
    title: "Danh sách thực đơn",
    description: "Quản lý cấu trúc thực đơn và món bán.",
    path: config.routes.group_menu,
    icon: UnorderedListOutlined,
    tone: "neutral",
  },
  {
    key: "service-quality",
    title: "Chất lượng dịch vụ",
    description: "Xem phản hồi và vấn đề từ khách hàng.",
    path: config.routes.manage_request_rate,
    icon: CustomerServiceOutlined,
    tone: "neutral",
  },
  {
    key: "sales",
    title: "Doanh số bán hàng",
    description: "Theo dõi kết quả bán hàng và vận hành ca.",
    path: config.routes.order_summary,
    icon: BarChartOutlined,
    tone: "neutral",
  },
];
