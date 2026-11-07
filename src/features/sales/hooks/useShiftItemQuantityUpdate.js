
import { useCallback, useRef, useState } from "react";
import { updateShiftInventory } from "../api";
import {
  buildInventoryChanges,
  validateInventoryDraft,
} from "../utils/shiftInventoryEdit";

export const useShiftItemQuantityUpdate = ({ refreshSummary }) => {
  const [updating, setUpdating] = useState(false);
  const busy = useRef(false);
  const pending = useRef(null);

  const resetPending = useCallback(() => {
    pending.current = null;
  }, []);

  const updateShiftItems = useCallback(
    async (shiftId, draft, reason) => {
      if (busy.current) return { updated: false };
      if (!shiftId) throw new Error("Không tìm được ca đang mở.");

      const validationError = validateInventoryDraft(draft);
      if (validationError) throw new Error(validationError);

      const why = String(reason || "").trim();
      if (!why || why.length > 255) {
        throw new Error("Lý do phải dài từ 1 đến 255 ký tự.");
      }

      const items = buildInventoryChanges(draft);
      if (!items.length) return { updated: false };

      const body = { reason: why, items };
      const fingerprint = JSON.stringify([shiftId, body]);

      if (pending.current?.fingerprint !== fingerprint) {
        if (!window.crypto?.randomUUID) {
          throw new Error("Trình duyệt chưa hỗ trợ UUID an toàn.");
        }
        pending.current = {
          fingerprint,
          key: window.crypto.randomUUID(),
        };
      }

      busy.current = true;
      setUpdating(true);

      try {
        const result = await updateShiftInventory(
          shiftId, body, pending.current.key
        );

        resetPending();

        // PUT đã thành công: lỗi refresh không được gửi PUT lần nữa.
        try {
          await refreshSummary?.();
        } catch (_) {
          // Màn doanh số có thể refresh lại sau.
        }

        return { updated: true, result };
      } catch (error) {
        const status = error?.response?.status;

        // 4xx đã bị từ chối.
        // Timeout / 5xx: giữ key để retry cùng request.
        if (status >= 400 && status < 500) {
          resetPending();
        }
        throw error;
      } finally {
        busy.current = false;
        setUpdating(false);
      }
    },
    [refreshSummary, resetPending]
  );

  return { updating, updateShiftItems, resetPending };
};
