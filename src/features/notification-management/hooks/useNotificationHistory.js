import { useCallback, useEffect, useMemo, useState } from "react";

import { isValidNotificationAudience } from "../constants";

/* ========================================
   Storage

   Dùng key mới hoàn toàn.

   KHÔNG migrate:
   localStorage["notifications"]

   vì legacy data không chứng minh được
   notification thực sự send thành công.
======================================== */

const STORAGE_PREFIX = "freshy.notificationManagement.sentHistory.v1";

/* ========================================
   Helpers
======================================== */

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

const isValidIsoDate = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
};

const createClientId = () => {
  /*
   * Ưu tiên UUID native.
   */
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  /*
   * Fallback chỉ phục vụ local history.
   * Không phải backend/domain ID.
   */
  return ["local", Date.now(), Math.random().toString(36).slice(2, 10)].join(
    "-",
  );
};

const buildStorageKey = (managerPhone) => {
  const normalizedPhone = normalizeText(managerPhone);

  if (!normalizedPhone) {
    return null;
  }

  /*
   * Scope history theo manager.
   *
   * Nếu cùng browser đăng nhập manager khác,
   * history không bị trộn vào nhau.
   */
  return [STORAGE_PREFIX, encodeURIComponent(normalizedPhone)].join(":");
};

const normalizeHistoryItem = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const clientId = normalizeText(value.clientId);

  const audience = String(value.audience ?? "");

  const title = normalizeText(value.title);

  const body = normalizeText(value.body);

  const sentAt = normalizeText(value.sentAt);

  if (
    !clientId ||
    !isValidNotificationAudience(audience) ||
    !title ||
    !body ||
    !isValidIsoDate(sentAt)
  ) {
    return null;
  }

  return {
    clientId,

    audience,

    title,

    body,

    sentAt,
  };
};

const normalizeHistory = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeHistoryItem)
    .filter(Boolean)
    .sort(
      (first, second) => Date.parse(second.sentAt) - Date.parse(first.sentAt),
    );
};

const readStorage = (storageKey) => {
  if (!storageKey) {
    return [];
  }

  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      return [];
    }

    return normalizeHistory(JSON.parse(raw));
  } catch {
    /*
     * Corrupted / unavailable localStorage
     * không được làm crash page.
     */
    return [];
  }
};

const writeStorage = (storageKey, history) => {
  if (!storageKey) {
    throw new Error("Không xác định được vùng lưu lịch sử thông báo.");
  }

  localStorage.setItem(storageKey, JSON.stringify(history));
};

/* ========================================
   Hook
======================================== */

function useNotificationHistory(managerPhone) {
  /* ========================================
     Storage key
  ======================================== */

  const storageKey = useMemo(
    () => buildStorageKey(managerPhone),
    [managerPhone],
  );

  /* ========================================
     State
  ======================================== */

  const [history, setHistory] = useState([]);

  /* ========================================
     Load when manager changes
  ======================================== */

  useEffect(() => {
    setHistory(readStorage(storageKey));
  }, [storageKey]);

  /* ========================================
     Sync across tabs

     storage event chỉ fire ở tab khác,
     nên phù hợp để sync browser history.
  ======================================== */

  useEffect(() => {
    if (!storageKey) {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key !== storageKey) {
        return;
      }

      setHistory(readStorage(storageKey));
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [storageKey]);

  /* ========================================
     Append verified send

     Chỉ gọi sau khi API send thành công.
  ======================================== */

  const appendHistory = useCallback(
    (payload) => {
      const audience = String(payload?.audience ?? "");

      const title = normalizeText(payload?.title);

      const body = normalizeText(payload?.body);

      if (
        !storageKey ||
        !isValidNotificationAudience(audience) ||
        !title ||
        !body
      ) {
        return {
          ok: false,

          record: null,

          error: new Error("Không thể lưu lịch sử thông báo."),
        };
      }

      const record = {
        clientId: createClientId(),

        audience,

        title,

        body,

        sentAt: new Date().toISOString(),
      };

      const nextHistory = [record, ...history];

      try {
        /*
         * Persist trước.
         *
         * Nếu localStorage fail thì không
         * giả vờ state đã được lưu thành công.
         */
        writeStorage(storageKey, nextHistory);

        setHistory(nextHistory);

        return {
          ok: true,

          record,

          error: null,
        };
      } catch (error) {
        return {
          ok: false,

          record: null,

          error,
        };
      }
    },
    [history, storageKey],
  );

  /* ========================================
     Remove local record

     B6 sẽ dùng.

     Đây chỉ xóa history trên browser,
     KHÔNG xóa notification backend.
  ======================================== */

  const removeHistoryItem = useCallback(
    (clientId) => {
      const nextHistory = history.filter((item) => item.clientId !== clientId);

      try {
        writeStorage(storageKey, nextHistory);

        setHistory(nextHistory);

        return {
          ok: true,

          error: null,
        };
      } catch (error) {
        return {
          ok: false,

          error,
        };
      }
    },
    [history, storageKey],
  );

  /* ========================================
     Public API
  ======================================== */

  return {
    history,

    appendHistory,
    removeHistoryItem,
  };
}

export default useNotificationHistory;
