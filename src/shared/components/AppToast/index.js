import React from "react";

import { notification } from "antd";

import {
  CheckOutlined,
  CloseOutlined,
  ExclamationOutlined,
  InfoOutlined,
} from "@ant-design/icons";

import "./AppToast.scss";

const DEFAULT_TOAST_KEY = "freshy-app-toast";

const TOAST_META = {
  success: {
    defaultTitle: "Thành công",

    duration: 2.5,

    icon: <CheckOutlined />,
  },

  info: {
    defaultTitle: "Thông tin",

    duration: 3,

    icon: <InfoOutlined />,
  },

  warning: {
    defaultTitle: "Cần lưu ý",

    duration: 4,

    icon: <ExclamationOutlined />,
  },

  error: {
    defaultTitle: "Đã có lỗi xảy ra",

    duration: 4,

    icon: <CloseOutlined />,
  },
};

const normalizeToastOptions = (options) => {
  /*
   * Backward compatibility:
   *
   * toast.success("Đã lưu")
   *
   * và:
   *
   * toast.success({
   *   title: "Đã lưu",
   *   description: "...",
   * })
   *
   * đều hợp lệ.
   */
  if (typeof options === "string") {
    return {
      title: options,
    };
  }

  if (!options || typeof options !== "object") {
    return {};
  }

  return options;
};

const resolveTitle = ({ title, message, fallback }) =>
  title || message || fallback;

const openToast = ({
  type = "info",

  title,
  message,
  description,

  duration,
  key,

  placement = "topRight",
}) => {
  const meta = TOAST_META[type] || TOAST_META.info;

  const resolvedTitle = resolveTitle({
    title,
    message,

    fallback: meta.defaultTitle,
  });

  /*
   * Chỉ cho phép 1 toast cùng lúc.
   *
   * Toast mới update toast cũ
   * thay vì stack thành nhiều card.
   */
  notification.config({
    placement,

    top: 76,

    maxCount: 1,
  });

  notification.open({
    key: key || DEFAULT_TOAST_KEY,

    placement,

    duration: duration ?? meta.duration,

    icon: null,

    description: null,

    closeIcon: <CloseOutlined />,

    className: [
      "freshy-toast",

      `freshy-toast--${type}`,

      description ? "freshy-toast--with-description" : "freshy-toast--compact",
    ].join(" "),

    /*
     * AntD v5 vẫn render một notice shell riêng.
     * Reset trực tiếp bằng inline style để shell đó
     * không tạo card trắng phía sau custom toast.
     */
    style: {
      width: 360,
      padding: 0,
      overflow: "visible",
      border: 0,
      borderRadius: 0,
      background: "transparent",
      boxShadow: "none",
    },

    message: (
      <div className="freshy-toast__content">
        <div
          className={["freshy-toast__icon", `freshy-toast__icon--${type}`].join(
            " ",
          )}
          aria-hidden="true"
        >
          {meta.icon}
        </div>

        <div className="freshy-toast__body">
          <div className="freshy-toast__title">{resolvedTitle}</div>

          {description ? (
            <div className="freshy-toast__description">{description}</div>
          ) : null}
        </div>
      </div>
    ),
  });
};

const toast = {
  success: (options = {}) =>
    openToast({
      ...normalizeToastOptions(options),

      type: "success",
    }),

  info: (options = {}) =>
    openToast({
      ...normalizeToastOptions(options),

      type: "info",
    }),

  warning: (options = {}) =>
    openToast({
      ...normalizeToastOptions(options),

      type: "warning",
    }),

  error: (options = {}) =>
    openToast({
      ...normalizeToastOptions(options),

      type: "error",
    }),

  destroy: () => notification.destroy(),
};

export default toast;
