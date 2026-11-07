import { useEffect, useRef, useState } from "react";

import { FileExcelOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";

import toast from "../../../../shared/components/AppToast";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppSelect from "../../../../shared/components/AppSelect";

import AppButton from "../../../../shared/components/AppButton";

import { useKitchens } from "../../../../shared/hooks";

import {
  ExportOrdersModal,
  OrderSummaryDetail,
  OrderSummaryTable,
} from "../../components";

import { useOrderSummary, useOrderSummaryExport } from "../../hooks";
import { getOrderSummaryDetail } from "../../api";
import { normalizeOrderSummaryDetail } from "../../utils/orderSummaryDetail";

import "./OrderSummaryPage.scss";

const ORDER_SUMMARY_STATUS = "FINISHED";

const ORDER_SUMMARY_PAGE_SIZE = 10;

const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  return responseData?.message || error?.message || fallbackMessage;
};

const getExportSuccessMessage = ({ exportOption, type }) => {
  if (exportOption === "all") {
    return type === "date"
      ? "Xuất tất cả theo ngày thành công!"
      : "Xuất tất cả theo khoảng thời gian thành công!";
  }

  return type === "date"
    ? "Xuất đơn vị theo ngày thành công!"
    : "Xuất đơn vị theo khoảng thời gian thành công!";
};

function OrderSummaryPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailSelection, setDetailSelection] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const detailRequestId = useRef(0);

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { userAuth } = useAuth();

  const phoneNumber = userAuth.userPhone;

  /* ========================================
     Kitchen
  ======================================== */

  const {
    kitchens,

    selectedKitchenId,

    loading: kitchensLoading,

    error: kitchensError,

    handleKitchenSelect,
  } = useKitchens(phoneNumber);

  const selectedKitchen = kitchens.find(
    (kitchen) => String(kitchen.value) === String(selectedKitchenId),
  );

  const selectedKitchenName = selectedKitchen?.label || "";

  /* ========================================
     Report
  ======================================== */

  const {
    orders,

    loading: ordersLoading,

    loadingMore,

    error: ordersError,

    hasMore,

    loadMore,
  } = useOrderSummary({
    status: ORDER_SUMMARY_STATUS,

    posId: selectedKitchenId,

    pageSize: ORDER_SUMMARY_PAGE_SIZE,
  });

  /* ========================================
     Export
  ======================================== */

  const {
    units,

    loadingUnits,

    unitsError,

    exporting,

    exportOrders,
  } = useOrderSummaryExport({
    status: ORDER_SUMMARY_STATUS,

    posId: selectedKitchenId,

    enabled: exportModalOpen,
  });

  /* ========================================
     Context reset
  ======================================== */

  useEffect(() => {
    ++detailRequestId.current;
    setSelectedOrder(null);
    setDetailSelection(null);
    setDetailError(null);
    setDetailLoading(false);
  }, [selectedKitchenId]);

  /* ========================================
     Errors
  ======================================== */

  useEffect(() => {
    if (!kitchensError) {
      return;
    }

    toast.error({
      title: "Không thể tải danh sách bếp",

      description: getErrorMessage(kitchensError, "Vui lòng thử lại."),
    });
  }, [kitchensError]);

  useEffect(() => {
    if (!ordersError) {
      return;
    }

    toast.error({
      title: "Không thể tải đơn hàng",

      description: getErrorMessage(
        ordersError,
        "Không thể tải dữ liệu tổng hợp đơn hàng.",
      ),
    });
  }, [ordersError]);

  useEffect(() => {
    if (!unitsError) {
      return;
    }

    toast.error({
      title: "Không thể tải danh sách đơn vị",

      description: getErrorMessage(unitsError, "Vui lòng thử lại."),
    });
  }, [unitsError]);

  /* ========================================
     Detail
  ======================================== */

  const handleOpenDetail = async ({
    orderId,
    posId = selectedKitchenId,
  }) => {
    if (!orderId || posId == null) return;

    const requestId = ++detailRequestId.current;

    setDetailSelection({ orderId, posId });
    setSelectedOrder({ orderId, status: "FINISHED" });
    setDetailLoading(true);
    setDetailError(null);

    try {
      const data = await getOrderSummaryDetail(orderId, posId);

      if (requestId !== detailRequestId.current) return;

      setSelectedOrder(normalizeOrderSummaryDetail(data));
    } catch (error) {
      if (requestId !== detailRequestId.current) return;

      setDetailError(
        getErrorMessage(error, "Không thể tải chi tiết đơn hàng.")
      );
    } finally {
      if (requestId === detailRequestId.current) {
        setDetailLoading(false);
      }
    }
  };

  const handleCloseDetail = () => {
    ++detailRequestId.current;
    setSelectedOrder(null);
    setDetailSelection(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  /* ========================================
     Export
  ======================================== */

  const handleOpenExport = () => {
    if (
      selectedKitchenId === null ||
      selectedKitchenId === undefined ||
      selectedKitchenId === ""
    ) {
      return;
    }

    setExportModalOpen(true);
  };

  const handleCloseExport = () => {
    if (exporting) {
      return;
    }

    setExportModalOpen(false);
  };

  const handleExport = async (values) => {
    try {
      const result = await exportOrders(values);

      if (!result) {
        return;
      }

      toast.success({
        title: "Xuất Excel thành công",

        description: getExportSuccessMessage(result),
      });

      setExportModalOpen(false);
    } catch (exportError) {
      console.error("Lỗi khi export Excel:", exportError);

      toast.error({
        title: "Xuất Excel thất bại",

        description: getErrorMessage(exportError, "Không thể xuất file Excel."),
      });

      throw exportError;
    }
  };

  const hasKitchen =
    selectedKitchenId !== null &&
    selectedKitchenId !== undefined &&
    selectedKitchenId !== "";

  return (
    <div className="order-summary-page">
      <ManagementPageHeader
        title="Tổng hợp đơn hàng"
        description="Theo dõi đơn hàng đã hoàn tất và xuất báo cáo theo trung tâm."
        actions={
          <>
            <AppSelect
              size="lg"
              value={hasKitchen ? selectedKitchenId : undefined}
              options={kitchens}
              loading={kitchensLoading}
              disabled={kitchens.length === 0}
              placeholder="Chọn bếp"
              onChange={handleKitchenSelect}
            />

            <AppButton
              icon={<FileExcelOutlined />}
              loading={exporting}
              disabled={!hasKitchen}
              onClick={handleOpenExport}
            >
              Xuất Excel
            </AppButton>
          </>
        }
      />

      <main className="order-summary-page__content">
        <OrderSummaryTable
          orders={orders}
          kitchenName={selectedKitchenName}
          loading={kitchensLoading || ordersLoading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onDetail={handleOpenDetail}
        />
      </main>

      <OrderSummaryDetail
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        loading={detailLoading}
        error={detailError}
        onRetry={() =>
          detailSelection && handleOpenDetail(detailSelection)
        }
        onClose={handleCloseDetail}
      />

      <ExportOrdersModal
        open={exportModalOpen}
        kitchenName={selectedKitchenName}
        units={units}
        loadingUnits={loadingUnits}
        exporting={exporting}
        onClose={handleCloseExport}
        onExport={handleExport}
      />
    </div>
  );
}

export default OrderSummaryPage;
