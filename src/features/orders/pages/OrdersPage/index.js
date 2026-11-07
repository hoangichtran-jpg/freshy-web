import { useEffect, useMemo, useState } from "react";

import "./OrdersPage.scss";

import {
  OrderHeader,
  OrderStatusTabs,
  OrderTable,
  OrderDetail,
} from "../../components";

import { useAuth } from "../../../../shared/auth";

import { useKitchens } from "../../../../shared/hooks";

import toast from "../../../../shared/components/AppToast";

import { useOrders } from "../../hooks/useOrders";

import { useOrderActions } from "../../hooks/useOrderActions";

import { useOrderFilters } from "../../hooks/useOrderFilters";

import { useOrderRealtime } from "../../hooks/useOrderRealtime";

import {
  ORDER_TABS,
} from "../../constants/order.constants";

function OrdersPage() {
  const [activeTab, setActiveTab] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [orderActionLoading, setOrderActionLoading] = useState(null);

  /* ========================================
     Auth
  ======================================== */

  const { userAuth, tokenStr } = useAuth();

  const phoneNumber = userAuth.userPhone;

  /* ========================================
     Current status
  ======================================== */

  const currentStatus = ORDER_TABS[activeTab].status;

  /* ========================================
     Kitchen
  ======================================== */

  const { posIds, kitchens, selectedKitchen, posName, handleKitchenSelect } =
    useKitchens(phoneNumber);

  const activePosIds = useMemo(() => {
    if (!selectedKitchen?.value || selectedKitchen.value === "ALL") {
      return posIds;
    }

    return [selectedKitchen.value];
  }, [selectedKitchen?.value, posIds]);

  /* ========================================
     Orders
  ======================================== */

  const {
    orders,
    ordersByTab,
    loading,
    error,
    refetchOrders,
    moveOrder,
    removeOrder,
  } = useOrders({
    activeTab,

    posIds: activePosIds,
  });

  /* ========================================
     Realtime

     Mobile:
     PENDING → CHECKING

     Backend:
     RabbitMQ
     → STOMP event
     → this page

     Nếu user đang xem CHECKING:
     fetch lại dữ liệu từ backend.

     Không reload browser.
     Backend vẫn là source of truth.
  ======================================== */

  useOrderRealtime({
    token: tokenStr,

    posIds: activePosIds,

    onOrderStatusChanged: async (event) => {
      /*
       * Web realtime chỉ đóng vai trò
       * báo rằng dữ liệu order của POS
       * vừa thay đổi.
       *
       * Backend API vẫn là source of truth.
       */

      if (
        selectedOrder &&
        String(selectedOrder.orderId) === String(event?.orderId)
      ) {
        /*
         * Browser khác vừa thay đổi chính
         * order đang mở.
         *
         * Không cho user tiếp tục thao tác
         * trên modal/data cũ.
         */
        setSelectedOrder(null);
      }

      setCurrentPage(1);

      await refetchOrders();
    },
  });

  /* ========================================
     Tab counts
  ======================================== */

  const tabCounts = useMemo(() => {
    return ORDER_TABS.reduce((result, tab) => {
      const hasLoaded = Object.prototype.hasOwnProperty.call(
        ordersByTab,
        tab.status,
      );

      result[tab.status] = hasLoaded
        ? ordersByTab[tab.status]?.length || 0
        : null;

      return result;
    }, {});
  }, [ordersByTab]);

  /* ========================================
     Actions
  ======================================== */

  const { confirmOrder, finishOrder, cancelOrder } = useOrderActions({
    phoneNumber,
    moveOrder,
    removeOrder,
  });

  /* ========================================
     Search
  ======================================== */

  const { filteredOrders, searchText, searchOrders, clearSearch } =
    useOrderFilters({
      orders,
    });

  /* ========================================
     Reset when context changes
  ======================================== */

  useEffect(() => {
    clearSearch();

    setSelectedOrder(null);

    setCurrentPage(1);
  }, [activeTab, selectedKitchen?.value, clearSearch]);

  const handleSearch = (value) => {
    setCurrentPage(1);

    searchOrders(value);
  };

  /* ========================================
     Error
  ======================================== */

  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error({
      title: "Không thể tải đơn hàng",

      description: "Vui lòng thử lại.",
    });
  }, [error]);

  /* ========================================
     Detail
  ======================================== */

  const handleDetail = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  /* ========================================
     Confirm
  ======================================== */

  const handleConfirm = async (orderId) => {
    if (orderActionLoading) {
      return;
    }

    try {
      setOrderActionLoading("confirm");

      await confirmOrder(orderId);

      toast.success({
        title: "Cập nhật đơn hàng thành công",
      });

      closeOrderDetail();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      toast.error({
        title: "Không thể cập nhật đơn hàng",

        description: "Vui lòng thử lại.",
      });
    } finally {
      setOrderActionLoading(null);
    }
  };

  /* ========================================
     Finish
  ======================================== */

  const handleFinish = async (orderId) => {
    if (orderActionLoading) {
      return;
    }

    try {
      setOrderActionLoading("finish");

      await finishOrder(orderId, currentStatus);

      toast.success({
        title: "Cập nhật đơn hàng thành công",
      });

      closeOrderDetail();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      toast.error({
        title: "Không thể cập nhật đơn hàng",

        description: "Vui lòng thử lại.",
      });
    } finally {
      setOrderActionLoading(null);
    }
  };

  /* ========================================
     Cancel
  ======================================== */

  const handleCancel = async (orderId) => {
    if (orderActionLoading) {
      return;
    }

    try {
      setOrderActionLoading("cancel");

      await cancelOrder(orderId, currentStatus);

      toast.success({
        title: "Đã huỷ đơn hàng",
      });

      closeOrderDetail();
    } catch (error) {
      console.error("Lỗi khi huỷ đơn hàng:", error);

      toast.error({
        title: "Không thể huỷ đơn hàng",

        description: "Vui lòng thử lại.",
      });
    } finally {
      setOrderActionLoading(null);
    }
  };

  /* ========================================
     Table data
  ======================================== */

  const unitOptions = useMemo(() => {
    return Array.from(
      new Set(
        Object.values(ordersByTab)
          .flat()
          .map((order) => order.unit)
          .filter((unit) => unit && unit.trim() !== ""),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "vi", {
        sensitivity: "base",
      }),
    );
  }, [ordersByTab]);

  const emptyMessage =
    orders.length === 0
      ? "Không có đơn hàng ở trạng thái này"
      : "Không tìm thấy đơn hàng phù hợp";

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <OrderHeader
          title="Danh sách đơn hàng"
          kitchens={kitchens}
          selectedKitchen={posName}
          handleKitchenSelect={handleKitchenSelect}
          isSearch
          searchValue={searchText}
          onSearch={handleSearch}
        />
      </div>

      <div className="orders-page__status">
        <OrderStatusTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          counts={tabCounts}
        />
      </div>

      <div className="orders-page__content">
        <OrderTable
          data={filteredOrders}
          loading={loading}
          unitOptions={unitOptions}
          onDetail={handleDetail}
          emptyMessage={emptyMessage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedOrder ? (
        <OrderDetail
          order={selectedOrder}
          onClose={closeOrderDetail}
          onConfirm={handleConfirm}
          status={currentStatus}
          onCancel={handleCancel}
          onFinish={handleFinish}
          actionLoading={orderActionLoading}
        />
      ) : null}
    </div>
  );
}

export default OrdersPage;
