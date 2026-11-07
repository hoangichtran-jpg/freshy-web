import { useEffect, useRef, useState } from "react";
import { Segmented, Spin } from "antd";
import { ShopOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";
import toast from "../../../../shared/components/AppToast";
import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";
import AppSelect from "../../../../shared/components/AppSelect";
import AppButton from "../../../../shared/components/AppButton";
import EmptyState from "../../../../shared/components/EmptyState";
import { useKitchens } from "../../../../shared/hooks";

import {
  EditInitialQuantityModal,
  SalesItemsTable,
  SalesSummaryStats,
  ShiftHistoryPanel,
} from "../../components";
import { useShiftItemQuantityUpdate, useShiftSummary } from "../../hooks";
import { getCurrentShift, getShiftInventoryEditContext } from "../../api";
import { getItemMenuIds } from "../../../shift-inventory/utils/menuMembership";
import OrderAdmissionCard from "../../components/OrderAdmissionCard";
import useShiftOperatingControls from "../../../kitchen-menu/hooks/useShiftOperatingControls";

import "./SalesSummaryPage.scss";
import "./ShiftHistoryTabs.scss";

const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  if (typeof responseData === "string") return responseData;
  return responseData?.message || error?.message || fallbackMessage;
};

function SalesSummaryPage() {
  const [activeTab, setActiveTab] = useState("current");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [inventoryContext, setInventoryContext] = useState(null);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const editRequestRef = useRef(0);
  const { userAuth } = useAuth();
  const phoneNumber = userAuth?.userPhone;

  /* The kitchen selection remains shared by both tabs. */
  const {
    kitchens,
    selectedKitchenId,
    loading: kitchensLoading,
    error: kitchensError,
    handleKitchenSelect,
  } = useKitchens(phoneNumber);

  /* Current shift data is separate from historical list/detail data. */
  const {
    shiftSummary,
    loading: summaryLoading,
    error: summaryError,
    refresh: refreshSummary,
  } = useShiftSummary(selectedKitchenId);

  const { updating, updateShiftItems, resetPending } =
    useShiftItemQuantityUpdate({ refreshSummary });

  useEffect(() => {
    if (!kitchensError) return;
    toast.error({
      title: "Không thể tải danh sách bếp",
      description: getErrorMessage(kitchensError, "Vui lòng thử lại."),
    });
  }, [kitchensError]);

  useEffect(() => {
    if (!summaryError || activeTab !== "current") return;
    toast.error({
      title: "Không thể tải doanh số",
      description: getErrorMessage(summaryError, "Không thể tải dữ liệu ca."),
    });
  }, [summaryError, activeTab]);

  const items = Array.isArray(shiftSummary?.items) ? shiftSummary.items : [];
  // Legacy heuristic; not a substitute for backend shift status.
  const hasOpenShift = items.length > 0;
  const totalSold = items.reduce(
    (total, item) => total + Number(item.totalItem ?? 0),
    0,
  );
  const canEditInventory = (userAuth?.userRoles || []).some(
    (r) => r === "ROLE_ADMIN" || r === "ROLE_SUPER_ADMIN",
  );

  const admission = useShiftOperatingControls({
    posId: selectedKitchenId,
    open: activeTab === "current" && selectedKitchenId != null,
    enabled: canEditInventory,
  });

  const toggleAcceptance = async (target) => {
    try {
      await admission.changeAcceptance(target);
      toast.success({ title: target === "PAUSED" ? "Đã tạm ngừng nhận đơn" : "Đã mở lại nhận đơn" });
    } catch (error) {
      toast.error({ title: "Không thể đổi trạng thái nhận đơn",
        description: getErrorMessage(error, "Vui lòng thử lại.") });
      throw error;
    }
  };

  const refreshAdmission = () => {
    admission.refreshStatus().catch(() => {});
  };

  const openInventoryEditor = async () => {
    if (selectedKitchenId == null || loadingEditor || updating) return;

    const id = ++editRequestRef.current;
    setLoadingEditor(true);

    try {
      const current = await getCurrentShift(selectedKitchenId);
      if (!current?.shiftId || current.status !== "OPENED") {
        throw new Error("Bếp chưa có ca đang mở.");
      }

      const editor = await getShiftInventoryEditContext(current.shiftId);

      if (id !== editRequestRef.current) return;
      if (
        String(editor.posId) !== String(selectedKitchenId) ||
        editor.status !== "OPENED"
      ) {
        throw new Error("Dữ liệu ca không khớp bếp đang chọn.");
      }

      // /inventory/edit must return the membership saved when opening the shift.
      // Do not reconstruct it from today's possibly changed kitchen menus.
      const items = Array.isArray(editor.items) ? editor.items : [];
      const itemsMissingMembership = items.filter(
        (item) => getItemMenuIds(item).length === 0,
      );

      if (itemsMissingMembership.length > 0) {
        toast.warning({
          title: "Thiếu thông tin menu của ca",
          description:
            `Có ${itemsMissingMembership.length} món chưa có menuId/menuIds. ` +
            "Vẫn chỉnh được số suất, định lượng; " +
            "chức năng đổi món trừ tồn bị khóa cho các món đó.",
        });
      }

      resetPending();
      setInventoryContext({ ...editor, items });
      setEditModalVisible(true);
    } catch (error) {
      if (id === editRequestRef.current) {
        toast.error({
          title: "Không thể mở chỉnh tồn kho",
          description: getErrorMessage(error, "Vui lòng thử lại."),
        });
      }
    } finally {
      if (id === editRequestRef.current) {
        setLoadingEditor(false);
      }
    }
  };

  const closeInventoryEditor = () => {
    if (updating) return;
    ++editRequestRef.current;
    setEditModalVisible(false);
    setInventoryContext(null);
    resetPending();
  };

  const pageLoading =
    kitchensLoading || (activeTab === "current" && summaryLoading);

  const handleSave = async (editItems, reason) => {
    try {
      const outcome = await updateShiftItems(
        inventoryContext?.shiftId,
        editItems,
        reason,
      );
      if (!outcome?.updated) return;

      toast.success({
        title: "Cập nhật thành công",
        description: "Các thay đổi của ca đã được lưu và ghi lịch sử.",
      });
      closeInventoryEditor();
    } catch (error) {
      toast.error({
        title: "Không thể cập nhật",
        description:
          error?.response?.status === 409
            ? "Dữ liệu ca đã thay đổi. Đóng và mở lại màn chỉnh tồn để lấy dữ liệu mới."
            : error?.response?.status == null || error?.response?.status >= 500
              ? "Chưa rõ trạng thái lưu. Giữ modal mở và bấm Lưu lại để retry cùng mã yêu cầu."
              : getErrorMessage(error, "Vui lòng thử lại."),
      });
    }
  };

  return (
    <div className="sales-summary-page">
      <ManagementPageHeader
        title="Doanh số bán hàng"
        description="Xem ca hiện tại và tra cứu lịch sử các ca theo bếp."
        actions={
          <>
            <AppSelect
              size="lg"
              value={selectedKitchenId ?? undefined}
              options={kitchens}
              loading={kitchensLoading}
              disabled={
                kitchens.length === 0 ||
                updating ||
                editModalVisible ||
                loadingEditor
              }
              placeholder="Chọn bếp"
              onChange={handleKitchenSelect}
            />
            {activeTab === "current" && canEditInventory && (
              <AppButton
                loading={loadingEditor}
                disabled={!hasOpenShift || pageLoading || updating}
                onClick={openInventoryEditor}
              >
                Chỉnh tồn kho
              </AppButton>
            )}
          </>
        }
      />

      <div className="sales-summary-page__tabs">
        <Segmented
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { label: "Ca hiện tại", value: "current" },
            { label: "Lịch sử ca", value: "history" },
          ]}
        />
      </div>

      {activeTab === "current" && selectedKitchenId != null && canEditInventory && (
        <OrderAdmissionCard key={String(selectedKitchenId)} operating={admission} onChange={toggleAcceptance}
          onRefresh={refreshAdmission} />
      )}

      <main className="sales-summary-page__content">
        {kitchensLoading ? (
          <section className="sales-summary-page__state">
            <Spin size="large" />
          </section>
        ) : selectedKitchenId == null ? (
          <section className="sales-summary-page__state">
            <EmptyState
              image="simple"
              description="Chưa có bếp / POS để hiển thị"
            />
          </section>
        ) : activeTab === "history" ? (
          <ShiftHistoryPanel
            key={String(selectedKitchenId)}
            posId={selectedKitchenId}
          />
        ) : summaryLoading ? (
          <section className="sales-summary-page__state">
            <Spin size="large" />
          </section>
        ) : !hasOpenShift ? (
          <section className="sales-summary-page__state sales-summary-page__state--empty">
            <div className="sales-summary-page__empty-icon">
              <ShopOutlined />
            </div>
            <h3>Chưa có ca đang mở</h3>
            <p>
              Khi bếp mở ca và có dữ liệu định lượng, doanh số của ca sẽ xuất
              hiện tại đây.
            </p>
          </section>
        ) : (
          <>
            <SalesSummaryStats
              totalOrder={shiftSummary?.totalOrder ?? 0}
              totalSold={totalSold}
              totalPrice={shiftSummary?.totalPrice ?? 0}
            />
            <SalesItemsTable items={items} />
          </>
        )}
      </main>

      <EditInitialQuantityModal
        open={editModalVisible}
        context={inventoryContext}
        loading={updating}
        onCancel={closeInventoryEditor}
        onSave={handleSave}
      />
    </div>
  );
}

export default SalesSummaryPage;
