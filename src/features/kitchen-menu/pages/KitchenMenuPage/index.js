import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppSelect from "../../../../shared/components/AppSelect";

import AppButton from "../../../../shared/components/AppButton";
import AppModal from "../../../../shared/components/AppModal";

import toast from "../../../../shared/components/AppToast";

import { useAuth } from "../../../../shared/auth";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import { useKitchens } from "../../../../shared/hooks";

import {
  KitchenMenuTable,
  ShiftActionModal,
  ShiftCloseBlockersModal,
  ShiftInventoryModal,
  ShiftMenuModal,
} from "../../components";

import {
  useKitchenMenuActions,
  useKitchenMenus,
  useShiftActions,
  useShiftOperatingControls,
} from "../../hooks";
import { shiftApiError } from "../../utils/shiftClose";
import { canShowPendingOrders, closeFailureMessage, isUnresolvedCloseConflict } from "../../utils/shiftCloseFlow";

import { buildShiftMenuSnapshot } from "../../utils/shiftMenuSnapshot";
import { shareShiftMenu } from "../../../shift-inventory/utils/menuMembership";

import "./KitchenMenuPage.scss";

/* ========================================
   Helpers
======================================== */

const getTodayIndex = () => {
  const vietnamDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const order = ["7", "1", "2", "3", "4", "5", "6"];

  return order[new Date(vietnamDate).getDay()];
};

const getToppingKey = (itemId, groupIndex, toppingId) =>
  `${itemId}-${groupIndex}-${toppingId}`;

const isEmptyValue = (value) =>
  value === null || value === undefined || value === "";

/* ========================================
   Page
======================================== */

export default function KitchenMenuPage() {
  const [nowDay] = useState(getTodayIndex);

  const { userAuth } = useAuth();

  const phoneNumber = userAuth?.userPhone;

  /* ========================================
     Kitchens
  ======================================== */

  const {
    kitchens,

    selectedKitchenId: posID,

    posName,

    loading: kitchensLoading,

    error: kitchensError,

    handleKitchenSelect,
  } = useKitchens(phoneNumber);

  /* ========================================
     Menus
  ======================================== */

  const {
    kitchenMenus,

    /*
     * Loading lần đầu / đổi bếp / retry.
     */
    loading: menusLoading,

    /*
     * Loading riêng khi chuyển page.
     */
    pageLoading,

    /*
     * Error chính của table.
     */
    error: menusError,

    /*
     * Error khi chuyển page.
     */
    pageError,

    pagination,

    changePage,

    refresh: refreshMenus,

    fetchActiveKitchenMenus,

    updateMenuStatus,

    removeMenu,
  } = useKitchenMenus(posID);

  const {
    changingMenuId,
    deletingMenuId,

    changeStatus,

    deleteMenu,
  } = useKitchenMenuActions();

  /* ========================================
     Shift actions
  ======================================== */

  const {
    openingShift,
    closingShift,

    openShift,

    closeShift: closeKitchenShift,
  } = useShiftActions();

  /*
   * Chỉ loading lớn khi:
   *
   * - danh sách kitchen đang load
   * - menu initial load đang chạy
   *
   * pageLoading KHÔNG nằm ở đây.
   */
  const loading = kitchensLoading || menusLoading;

  /* ========================================
     Delete menu
  ======================================== */

  const [menuToDelete, setMenuToDelete] = useState(null);

  /* ========================================
     Shift flow
  ======================================== */

  const [shiftActionOpen, setShiftActionOpen] = useState(false);

  const [shiftMenuOpen, setShiftMenuOpen] = useState(false);

  const [shiftInventoryOpen, setShiftInventoryOpen] = useState(false);

  /*
   * Loading riêng khi chuẩn bị
   * dữ liệu cho flow mở ca.
   */
  const [preparingShift, setPreparingShift] = useState(false);

  /*
   * Chống race condition khi user
   * đóng/mở modal nhanh trong lúc
   * active menu đang được fetch.
   */
  const shiftWizardRequestIdRef = useRef(0);

  const [isSpecial, setIsSpecial] = useState(false);

  const canManageShift = (userAuth?.userRoles || []).some(
    (role) => role === "ROLE_ADMIN" || role === "ROLE_SUPER_ADMIN",
  );
  const shiftControls = useShiftOperatingControls({
    posId: posID,
    open: shiftActionOpen,
    enabled: canManageShift,
  });
  const [closeBlockerContext, setCloseBlockerContext] = useState(null);
  const [closeBlockerOpen, setCloseBlockerOpen] = useState(false);
  const [closeNotice, setCloseNotice] = useState(null);


  /* ========================================
     Menu selection
  ======================================== */

  const [menuOptions, setMenuOptions] = useState([]);

  const [selectedMenus, setSelectedMenus] = useState([]);

  const [menuQuery, setMenuQuery] = useState("");

  const [hiddenMenus, setHiddenMenus] = useState(new Set());

  /* ========================================
     Inventory
  ======================================== */

  const [itemsList, setItemsList] = useState([]);

  const [initialQty, setInitialQty] = useState({});

  const [initialGram, setInitialGram] = useState({});

  const [toppingGram, setToppingGram] = useState({});

  const [ingredientMap, setIngredientMap] = useState({});

  /* ========================================
     Errors
  ======================================== */

  useEffect(() => {
    if (!kitchensError) {
      return;
    }

    toast.error({
      message: "Lỗi khi tải danh sách bếp.",
    });
  }, [kitchensError]);

  useEffect(() => {
    if (!menusError) {
      return;
    }

    toast.error({
      message: "Lỗi khi tải thực đơn.",
    });
  }, [menusError]);

  /*
   * Pagination fail không làm mất
   * table đang hiển thị.
   *
   * Chỉ báo lỗi bằng toast.
   */
  useEffect(() => {
    if (!pageError) {
      return;
    }

    toast.error({
      message: "Không thể chuyển trang",

      description: String(
        pageError?.response?.data || pageError?.message || "Vui lòng thử lại.",
      ),
    });
  }, [pageError]);

  /* ========================================
     Derived menu selection
  ======================================== */

  const normalizeText = useCallback(
    (value = "") =>
      value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase(),
    [],
  );

  const filteredMenuOptions = useMemo(
    () =>
      menuOptions.filter((menu) =>
        normalizeText(menu.label).includes(normalizeText(menuQuery)),
      ),
    [menuOptions, menuQuery, normalizeText],
  );

  const selectedValues = useMemo(
    () => new Set(selectedMenus.map((menu) => menu.value)),
    [selectedMenus],
  );

  const isAllFilteredSelected =
    filteredMenuOptions.length > 0 &&
    filteredMenuOptions.every((menu) => selectedValues.has(menu.value));

  const isIndeterminate =
    filteredMenuOptions.some((menu) => selectedValues.has(menu.value)) &&
    !isAllFilteredSelected;

  /* ========================================
     Reset shift flow
  ======================================== */

  const resetShiftFlow = useCallback(() => {
    /*
     * Invalidate request chuẩn bị
     * mở ca đang chạy.
     */
    shiftWizardRequestIdRef.current += 1;

    setPreparingShift(false);

    setShiftActionOpen(false);

    setShiftMenuOpen(false);

    setShiftInventoryOpen(false);

    setIsSpecial(false);

    setMenuOptions([]);

    setSelectedMenus([]);

    setMenuQuery("");

    setHiddenMenus(new Set());

    setItemsList([]);

    setInitialQty({});

    setInitialGram({});

    setToppingGram({});

    setIngredientMap({});
  }, []);

  /* ========================================
     Menu selection
  ======================================== */

  const toggleHidden = (menuId, checked) => {
    setHiddenMenus((previous) => {
      const next = new Set(previous);

      if (checked) {
        next.add(menuId);
      } else {
        next.delete(menuId);
      }

      return next;
    });
  };

  const toggleOne = useCallback(
    (menu, checked) => {
      if (checked) {
        if (!selectedValues.has(menu.value)) {
          setSelectedMenus((previous) => [...previous, menu]);
        }

        return;
      }

      setSelectedMenus((previous) =>
        previous.filter((selectedMenu) => selectedMenu.value !== menu.value),
      );

      setHiddenMenus((previous) => {
        const next = new Set(previous);

        next.delete(menu.value);

        return next;
      });
    },
    [selectedValues],
  );

  const toggleAllFiltered = useCallback(
    (checked) => {
      if (checked) {
        const menuMap = new Map(
          selectedMenus.map((menu) => [menu.value, menu]),
        );

        filteredMenuOptions.forEach((menu) => {
          menuMap.set(menu.value, menu);
        });

        setSelectedMenus(Array.from(menuMap.values()));

        return;
      }

      const filteredValues = new Set(
        filteredMenuOptions.map((menu) => menu.value),
      );

      setSelectedMenus((previous) =>
        previous.filter((menu) => !filteredValues.has(menu.value)),
      );

      setHiddenMenus((previous) => {
        const next = new Set(previous);

        filteredValues.forEach((value) => {
          next.delete(value);
        });

        return next;
      });
    },
    [filteredMenuOptions, selectedMenus],
  );

  const clearSelectedMenus = () => {
    setSelectedMenus([]);

    setHiddenMenus(new Set());
  };

  /* ========================================
     Table actions
  ======================================== */

  const handleStatusChange = async (menu, checked) => {
    const menuId = menu.managerMenuPosDayId;

    const previousStatus = menu.isActive;

    /*
     * Optimistic UI.
     *
     * User thấy switch đổi ngay.
     * Không reload table.
     */
    updateMenuStatus(menuId, checked);

    try {
      await changeStatus(menuId, checked);

      /*
       * Không show success toast.
       *
       * Switch chính là feedback
       * cho thao tác thành công.
       */
    } catch (error) {
      /*
       * API fail
       * → rollback.
       */
      updateMenuStatus(menuId, previousStatus);

      toast.error({
        message: "Không thể cập nhật trạng thái",

        description: String(
          error?.response?.data || error?.message || "Vui lòng thử lại.",
        ),
      });
    }
  };

  const handleRequestDelete = (menu) => {
    setMenuToDelete(menu);
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) {
      return;
    }

    const menuId = menuToDelete.managerMenuPosDayId;

    try {
      await deleteMenu(menuId);

      /*
       * Optimistic remove khỏi
       * current page.
       */
      removeMenu(menuId);

      setMenuToDelete(null);

      toast.success({
        message: "Xóa thực đơn thành công",
      });

      /*
       * Sync lại server page.
       *
       * Ví dụ:
       *
       * đang page cuối,
       * xóa record cuối,
       *
       * hook sẽ tự resolve về
       * page còn tồn tại.
       *
       * silent để không bật
       * full loading state.
       */
      refreshMenus({
        silent: true,
      }).catch(() => {});
    } catch (error) {
      toast.error({
        message: "Không thể xóa thực đơn",

        description: String(
          error?.response?.data || error?.message || "Vui lòng thử lại.",
        ),
      });
    }
  };

  const handleRetryMenus = () => {
    refreshMenus().catch(() => {});
  };

  /* ========================================
     Start shift flow
  ======================================== */

  const openShiftWizard = async () => {
    if (!posID || preparingShift) {
      return;
    }

    const requestId = ++shiftWizardRequestIdRef.current;

    setPreparingShift(true);

    try {
      /*
       * kitchenMenus chỉ chứa
       * CURRENT TABLE PAGE.
       *
       * Không được dùng:
       *
       * kitchenMenus.filter(...)
       *
       * để tạo danh sách menu
       * khi mở ca.
       *
       * Flow mở ca cần tất cả
       * active menus của kitchen.
       */
      const activeMenus = await fetchActiveKitchenMenus();

      /*
       * Modal đã đóng hoặc có
       * request mới hơn.
       */
      if (requestId !== shiftWizardRequestIdRef.current) {
        return;
      }

      const options = activeMenus.map((menu) => ({
        value: menu.managerMenuPosDayId,
        menuId: menu.menuId,
        label: menu.menuName,
        items: (menu.itemNames || []).filter((item) => item.isActive),
      }));

      if (options.length === 0) {
        toast.warning({
          message: "Không có thực đơn đang hoạt động",

          description: "Hãy bật ít nhất một thực đơn trước khi mở ca.",
        });

        return;
      }

      setMenuOptions(options);

      setSelectedMenus([]);

      setMenuQuery("");

      setHiddenMenus(new Set());

      setShiftActionOpen(false);

      setShiftMenuOpen(true);
    } catch (error) {
      if (requestId !== shiftWizardRequestIdRef.current) {
        return;
      }

      toast.error({
        message: "Không thể tải thực đơn cho ca",

        description: String(
          error?.response?.data || error?.message || "Vui lòng thử lại.",
        ),
      });
    } finally {
      if (requestId === shiftWizardRequestIdRef.current) {
        setPreparingShift(false);
      }
    }
  };

  const handleStartOpenShift = () => {
    openShiftWizard();
  };

  const handleBackToShiftAction = () => {
    setShiftMenuOpen(false);

    setShiftActionOpen(true);
  };

  /* ========================================
     Build inventory state
  ======================================== */

  const proceedToInventory = () => {
    if (!selectedMenus.length) {
      toast.warning({
        message: "Chưa chọn thực đơn",

        description: "Hãy chọn ít nhất một thực đơn để tiếp tục.",
      });

      return;
    }

    const flattened = selectedMenus.flatMap((menu) =>
      (menu.items || []).map((item) => ({
        ...item,

        menuId: menu.menuId,

        isSpecial: hiddenMenus.has(menu.value),
      })),
    );

    const byItemId = new Map();

    for (const item of flattened) {
      const existing = byItemId.get(item.itemId);

      if (!existing) {
        byItemId.set(item.itemId, {
          ...item,
          // Preserve all menus selected for this shift (not only the first).
          menuIds: [item.menuId],
        });

        continue;
      }

      existing.isSpecial = existing.isSpecial || item.isSpecial;
      if (!existing.menuIds.some((id) => String(id) === String(item.menuId))) {
        existing.menuIds.push(item.menuId);
      }

      if (existing.menuItemId == null && item.menuItemId != null) {
        existing.menuItemId = item.menuItemId;
      }
    }

    const uniqueItems = Array.from(byItemId.values());

    if (uniqueItems.length === 0) {
      toast.warning({
        message: "Không có món đang hoạt động",

        description:
          "Các thực đơn đã chọn không có món đang hoạt động để mở ca.",
      });

      return;
    }

    const sortedItems = uniqueItems
      .sort(
        (first, second) =>
          (first.ordinalNumber ?? 0) - (second.ordinalNumber ?? 0),
      )
      .map((item) => ({
        ...item,

        toppingDTO: (item.toppingDTO || [])
          /*
           * Group đã tắt
           * → bỏ khỏi flow mở ca.
           */
          .filter((group) => group?.isActive !== false)
          .slice()
          .sort(
            (firstGroup, secondGroup) =>
              (secondGroup.ordinalNumber ?? 0) -
              (firstGroup.ordinalNumber ?? 0),
          )
          .map((group) => ({
            ...group,

            toppings: (group.toppings || [])
              /*
               * Topping tắt
               * → bỏ khỏi flow.
               */
              .filter((topping) => Boolean(topping?.isActive))
              .slice()
              .sort(
                (firstTopping, secondTopping) =>
                  (firstTopping.ordinalNumber ?? 0) -
                  (secondTopping.ordinalNumber ?? 0),
              ),
          })),
      }));

    setItemsList(sortedItems);

    const quantities = {};

    const grams = {};

    const toppingQuantities = {};

    const ingredients = {};

    sortedItems.forEach((item) => {
      quantities[item.itemId] = 1;

      grams[item.itemId] = 1;

      (item.toppingDTO || []).forEach((group, groupIndex) => {
        (group.toppings || [])
          .filter((topping) => topping.isActive)
          .forEach((topping) => {
            const key = getToppingKey(
              item.itemId,
              groupIndex,
              topping.toppingId,
            );

            toppingQuantities[key] = 0;

            ingredients[key] = item.itemId;
          });
      });
    });

    setInitialQty(quantities);

    setInitialGram(grams);

    setToppingGram(toppingQuantities);

    setIngredientMap(ingredients);

    setShiftMenuOpen(false);

    setShiftInventoryOpen(true);
  };

  const handleBackToMenuSelection = () => {
    setShiftInventoryOpen(false);

    setShiftMenuOpen(true);
  };

  /* ========================================
     Inventory handlers
  ======================================== */

  const handleQuantityChange = (itemId, value) => {
    setInitialQty((previous) => ({
      ...previous,

      [itemId]: value,
    }));
  };

  const handleGramChange = (itemId, value) => {
    setInitialGram((previous) => ({
      ...previous,

      [itemId]: value,
    }));
  };

  const handleToppingGramChange = (key, value) => {
    setToppingGram((previous) => ({
      ...previous,

      [key]: value,
    }));
  };

  const handleIngredientChange = (key, value) => {
    setIngredientMap((previous) => ({
      ...previous,

      [key]: value,
    }));
  };

  /* ========================================
     Inventory validation
  ======================================== */

  const validateInventory = () => {
    for (const item of itemsList) {
      const quantity = initialQty[item.itemId];

      const gram = initialGram[item.itemId];

      if (
        isEmptyValue(quantity) ||
        !Number.isFinite(Number(quantity)) ||
        Number(quantity) < 1
      ) {
        toast.error({
          message: "Số suất chưa hợp lệ",

          description: `Vui lòng nhập số suất từ 1 trở lên cho "${item.name}".`,
        });

        return false;
      }

      if (
        isEmptyValue(gram) ||
        !Number.isFinite(Number(gram)) ||
        Number(gram) < 0
      ) {
        toast.error({
          message: "Định lượng chưa hợp lệ",

          description: `Vui lòng nhập định lượng từ 0 trở lên cho "${item.name}".`,
        });

        return false;
      }

      const groups = item.toppingDTO || [];

      for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const group = groups[groupIndex];

        const toppings = (group.toppings || []).filter(
          (topping) => topping.isActive,
        );

        for (const topping of toppings) {
          const key = getToppingKey(item.itemId, groupIndex, topping.toppingId);

          const quantitative = Number(toppingGram[key] ?? 0);

          if (quantitative > 0 && !ingredientMap[key]) {
            toast.error({
              message: "Thiếu món để trừ tồn",

              description: `Hãy chọn món để trừ tồn cho topping "${topping.toppingName}".`,
            });

            return false;
          }

          const target = itemsList.find(
            (candidate) =>
              String(candidate.itemId) === String(ingredientMap[key]),
          );
          if (!shareShiftMenu(item, target)) {
            toast.error({
              message: "Món trừ tồn không hợp lệ",
              description: `Topping "${topping.toppingName}" chỉ được trừ vào món cùng menu.`,
            });
            return false;
          }
        }
      }
    }

    return true;
  };

  /* ========================================
     Build payload
  ======================================== */

  const buildShiftPayload = () => {
    const itemMap = {};

    itemsList.forEach((item) => {
      itemMap[item.itemId] = {
        itemId: item.itemId,

        menuItemId: item.menuItemId,

        isSpecial: Boolean(item.isSpecial),

        initialQuantity: Number(initialQty[item.itemId]),

        initialQuantitative: Number(initialGram[item.itemId]),

        toppings: [],
      };
    });

    itemsList.forEach((item) => {
      (item.toppingDTO || []).forEach((group, groupIndex) => {
        (group.toppings || [])
          .filter((topping) => topping.isActive)
          .forEach((topping) => {
            const key = getToppingKey(
              item.itemId,
              groupIndex,
              topping.toppingId,
            );

            const quantity = Number(toppingGram[key] ?? 0);

            if (quantity <= 0) {
              return;
            }

            const targetItemId = ingredientMap[key];

            const parent = itemMap[item.itemId];

            const duplicateIndex = parent.toppings.findIndex(
              (existingTopping) =>
                existingTopping.toppingId === topping.toppingId &&
                existingTopping.toppingGroupId === group.id &&
                existingTopping.itemId === targetItemId,
            );

            if (duplicateIndex === -1) {
              parent.toppings.push({
                toppingGroupId: group.id,

                toppingId: topping.toppingId,

                quantitative: quantity,

                itemId: targetItemId,
              });

              return;
            }

            parent.toppings[duplicateIndex].quantitative += quantity;
          });
      });
    });

    return {
      name: `Shift ${nowDay}`,

      day: nowDay,

      isSpecial,

      // Existing stock-opening payload.
      // Keep the current processing unchanged.
      items: Object.values(itemMap),

      // New: complete opening menu snapshot.
      menuSnapshot: buildShiftMenuSnapshot({
        items: itemsList,
        initialQty,
        initialGram,
        toppingGram,
        ingredientMap,
      }),
    };
  };

  /* ========================================
     Open shift
  ======================================== */

  const confirmOpenShift = async () => {
    if (!posID) {
      toast.warning({
        message: "Chưa chọn trung tâm",

        description: "Hãy chọn trung tâm trước khi mở ca.",
      });

      return;
    }

    if (!validateInventory()) {
      return;
    }

    try {
      await openShift(posID, buildShiftPayload());

      toast.success({
        message: "Mở ca thành công",

        description: posName ? `${posName} đã bắt đầu ca làm việc.` : undefined,
      });

      resetShiftFlow();
    } catch (error) {
      toast.error({
        message: "Không thể mở ca",

        description: String(
          error?.response?.data || error?.message || "Vui lòng thử lại.",
        ),
      });
    }
  };

  /* ========================================
     Close shift
  ======================================== */

  const handleCloseShift = async () => {
    const snapshot = shiftControls.snapshot;
    if (!posID || !canManageShift || !snapshot ||
        snapshot.shiftStatus !== "OPENED" || !snapshot.shiftId ||
        (snapshot.posId != null && String(snapshot.posId) !== String(posID)) ||
        closingShift) return;

    // One explicit action. POST /close performs all final validation atomically.
    // Do not issue the read-only preflight first; the backend owns the final decision.
    try {
      await closeKitchenShift(posID, false);
      toast.success({ message: "Đóng ca thành công", description: `Ca #${snapshot.shiftId} đã được đóng.` });
      resetShiftFlow();
    } catch (error) {
      // Only this verified conflict is eligible for the pending-request explorer.
      if (isUnresolvedCloseConflict(error)) {
        try {
          const preflight = await shiftControls.checkClose(false);
          if (canShowPendingOrders(error, preflight, snapshot.shiftId)) {
            // The attempted close may have paused order admission; expose it to the manager.
            const latest = await shiftControls.refreshStatus().catch(() => null);
            setCloseBlockerContext({
              posId: posID, shiftId: snapshot.shiftId, kitchenName: posName,
              count: preflight.blockerCount,
              requestId: preflight.blockerCount === 1 && preflight.blockers.length === 1 &&
                !preflight.truncated ? preflight.blockers[0].requestId : null,
              acceptancePaused: latest?.shiftId === snapshot.shiftId &&
                latest?.admissionStatus === "PAUSED",
            });
            setShiftActionOpen(false);
            setCloseBlockerOpen(true);
            return;
          }
        } catch (_) {
          // Preflight is unavailable or the shift rotated. Fail closed; never guess PENDING.
        }
      }
      setShiftActionOpen(false);
      setCloseNotice(closeFailureMessage(error));
    }
  };

  const handleBlockersResolved = () => {
    setCloseBlockerOpen(false);
    setCloseBlockerContext(null);
    setShiftActionOpen(true); // Refresh shift snapshot before a new explicit close attempt.
    toast.info({ message: "Không còn đơn chặn ca", description: "Bạn có thể bấm Đóng ca để kiểm tra và xác nhận lại." });
  };

  const handleBlockersUnexpected = (message) => {
    setCloseBlockerOpen(false);
    setCloseBlockerContext(null);
    setCloseNotice(message);
  };


  /* ========================================
     Render
  ======================================== */

  return (
    <div className="kitchen-menu-page">
      <ManagementPageHeader
        title="Thực đơn bếp"
        description="Quản lý thực đơn và ca làm việc của từng trung tâm."
        actions={
          <div className="kitchen-menu-page__header-actions">
            <AppSelect
              size="lg"
              width={230}
              value={posID ?? undefined}
              options={kitchens}
              loading={kitchensLoading}
              disabled={kitchensLoading || kitchens.length === 0}
              placeholder={
                kitchens.length > 0 ? "Chọn trung tâm" : "Không có trung tâm"
              }
              onChange={handleKitchenSelect}
              className="kitchen-menu-page__kitchen-select"
            />

            <AppButton
              icon={<ClockCircleOutlined />}
              disabled={!posID || kitchensLoading}
              onClick={() => setShiftActionOpen(true)}
            >
              Quản lý ca
            </AppButton>
          </div>
        }
      />

      <KitchenMenuTable
        menus={kitchenMenus}
        pagination={pagination}
        selectedKitchenId={posID}
        /*
         * Full loading.
         */
        loading={loading}
        /*
         * Chuyển page:
         * table vẫn giữ nguyên.
         */
        pageLoading={pageLoading}
        error={menusError}
        changingMenuId={changingMenuId}
        deletingMenuId={deletingMenuId}
        onPageChange={changePage}
        onStatusChange={handleStatusChange}
        onDelete={handleRequestDelete}
        onRetry={handleRetryMenus}
      />

      <ShiftActionModal
        open={shiftActionOpen}
        kitchenName={posName}
        openingShift={openingShift || preparingShift}
        closingShift={closingShift}
        canManage={canManageShift}
        operating={shiftControls}
        onOpenShift={handleStartOpenShift}
        onCloseShift={handleCloseShift}
        onClose={() => {
          if (!shiftControls.changing && !closingShift && !openingShift) resetShiftFlow();
        }}
      />

      <ShiftCloseBlockersModal
        open={closeBlockerOpen}
        context={closeBlockerContext}
        onClose={() => { setCloseBlockerOpen(false); setCloseBlockerContext(null); }}
        onResolved={handleBlockersResolved}
        onUnexpected={handleBlockersUnexpected}
      />

      <AppModal open={Boolean(closeNotice)} width={430} footer={null}
        onCancel={() => setCloseNotice(null)} centered
        className="shift-close-notice-modal">
        <div className="shift-close-notice-modal__content">
          <ExclamationCircleOutlined className="shift-close-notice-modal__icon" />
          <h2>Chưa thể đóng ca</h2>
          <p>{closeNotice}</p>
          <AppButton onClick={() => setCloseNotice(null)}>Đã hiểu</AppButton>
        </div>
      </AppModal>

      <ShiftMenuModal
        open={shiftMenuOpen}
        menuOptions={menuOptions}
        filteredMenuOptions={filteredMenuOptions}
        selectedMenus={selectedMenus}
        selectedValues={selectedValues}
        hiddenMenus={hiddenMenus}
        menuQuery={menuQuery}
        isAllFilteredSelected={isAllFilteredSelected}
        isIndeterminate={isIndeterminate}
        onQueryChange={setMenuQuery}
        onToggleAll={toggleAllFiltered}
        onClearSelection={clearSelectedMenus}
        onToggleHidden={toggleHidden}
        onToggleOne={toggleOne}
        onNext={proceedToInventory}
        onBack={handleBackToShiftAction}
        onCancel={resetShiftFlow}
      />

      <ShiftInventoryModal
        open={shiftInventoryOpen}
        items={itemsList}
        initialQty={initialQty}
        initialGram={initialGram}
        toppingGram={toppingGram}
        ingredientMap={ingredientMap}
        loading={openingShift}
        onQuantityChange={handleQuantityChange}
        onGramChange={handleGramChange}
        onToppingGramChange={handleToppingGramChange}
        onIngredientChange={handleIngredientChange}
        onConfirm={confirmOpenShift}
        onBack={handleBackToMenuSelection}
        onCancel={resetShiftFlow}
      />

      <ConfirmModal
        open={Boolean(menuToDelete)}
        title="Xóa thực đơn"
        description={
          menuToDelete
            ? `Bạn có chắc chắn muốn xóa thực đơn "${menuToDelete.menuName}" khỏi trung tâm này?`
            : ""
        }
        cancelText="Quay lại"
        confirmText="Xóa thực đơn"
        danger
        loading={deletingMenuId === menuToDelete?.managerMenuPosDayId}
        onCancel={() => setMenuToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
