import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PropTypes from "prop-types";

import {
  CheckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import {
  Input,
  Popover,
} from "antd";

import "./ExactTimePicker.scss";

/* ========================================
   Helpers
======================================== */

const pad2 = (
  value,
) =>
  String(value).padStart(
    2,
    "0",
  );

export const parseTimeInput = (
  input,
) => {
  if (
    input === null ||
    input === undefined
  ) {
    return null;
  }

  let raw =
    String(input)
      .trim()
      .toLowerCase();

  if (!raw) {
    return null;
  }

  raw = raw
    .replace(/\s+/g, "")
    .replace(/[h.]/g, ":");

  let hour;
  let minute;

  if (
    raw.includes(":")
  ) {
    const parts =
      raw.split(":");

    if (
      parts.length !== 2
    ) {
      return null;
    }

    if (
      !parts[0] ||
      !parts[1]
    ) {
      return null;
    }

    hour =
      Number(
        parts[0],
      );

    minute =
      Number(
        parts[1],
      );
  } else {
    const digits =
      raw.replace(
        /\D/g,
        "",
      );

    if (
      digits.length <= 2
    ) {
      hour =
        Number(
          digits,
        );

      minute = 0;
    } else if (
      digits.length === 3
    ) {
      hour =
        Number(
          digits.slice(
            0,
            1,
          ),
        );

      minute =
        Number(
          digits.slice(
            1,
          ),
        );
    } else if (
      digits.length === 4
    ) {
      hour =
        Number(
          digits.slice(
            0,
            2,
          ),
        );

      minute =
        Number(
          digits.slice(
            2,
          ),
        );
    } else {
      return null;
    }
  }

  if (
    !Number.isInteger(
      hour,
    ) ||
    !Number.isInteger(
      minute,
    )
  ) {
    return null;
  }

  if (
    hour < 0 ||
    hour > 23
  ) {
    return null;
  }

  if (
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return `${pad2(
    hour,
  )}:${pad2(
    minute,
  )}`;
};

const HOURS =
  Array.from(
    {
      length: 24,
    },
    (
      _,
      index,
    ) => pad2(index),
  );

const MINUTES =
  Array.from(
    {
      length: 60,
    },
    (
      _,
      index,
    ) => pad2(index),
  );

/* ========================================
   Component
======================================== */

function ExactTimePicker({
  value,
  onChange,
  disabled,
  placeholder,
  className,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const hourRefs =
    useRef({});

  const minuteRefs =
    useRef({});

  const normalizedValue =
    useMemo(
      () =>
        parseTimeInput(
          value,
        ),
      [
        value,
      ],
    );

  const [
    selectedHour,
    selectedMinute,
  ] =
    normalizedValue
      ? normalizedValue.split(
          ":",
        )
      : [
          null,
          null,
        ];

  /* ========================================
     Scroll selected values into view
  ======================================== */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frameId =
      window.requestAnimationFrame(
        () => {
          if (
            selectedHour
          ) {
            hourRefs.current[
              selectedHour
            ]?.scrollIntoView(
              {
                block:
                  "center",
              },
            );
          }

          if (
            selectedMinute
          ) {
            minuteRefs.current[
              selectedMinute
            ]?.scrollIntoView(
              {
                block:
                  "center",
              },
            );
          }
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frameId,
      );
    };
  }, [
    open,
    selectedHour,
    selectedMinute,
  ]);

  /* ========================================
     Select parts
  ======================================== */

  const selectHour = (
    hour,
  ) => {
    const minute =
      selectedMinute ||
      "00";

    onChange?.(
      `${hour}:${minute}`,
    );
  };

  const selectMinute = (
    minute,
  ) => {
    const hour =
      selectedHour ||
      "00";

    onChange?.(
      `${hour}:${minute}`,
    );
  };

  /* ========================================
     Input
  ======================================== */

  const handleInputChange = (
    event,
  ) => {
    const nextValue =
      event.target.value;

    /*
     * Cho phép trạng thái đang gõ:
     * 1
     * 11
     * 11:
     * 11:0
     * 11:05
     */
    if (
      /^[0-9:.hH]*$/.test(
        nextValue,
      )
    ) {
      onChange?.(
        nextValue,
      );
    }
  };

  const normalizeInput = () => {
    const parsed =
      parseTimeInput(
        value,
      );

    if (
      parsed &&
      parsed !== value
    ) {
      onChange?.(
        parsed,
      );
    }
  };

  const handlePressEnter = (
    event,
  ) => {
    event.preventDefault();

    const parsed =
      parseTimeInput(
        value,
      );

    if (!parsed) {
      return;
    }

    onChange?.(
      parsed,
    );

    setOpen(false);
  };

  /* ========================================
     Popup
  ======================================== */

  const popupContent = (
    <div className="exact-time-picker__panel">
      {/* Header */}

      <div className="exact-time-picker__header">
        <div>
          <div className="exact-time-picker__title">
            Chọn giờ nhận
          </div>

          <div className="exact-time-picker__subtitle">
            Chọn chính xác giờ
            và phút
          </div>
        </div>

        {normalizedValue ? (
          <div className="exact-time-picker__preview">
            {
              normalizedValue
            }
          </div>
        ) : (
          <div className="exact-time-picker__preview exact-time-picker__preview--empty">
            --:--
          </div>
        )}
      </div>

      {/* Column labels */}

      <div className="exact-time-picker__labels">
        <span>
          Giờ
        </span>

        <span>
          Phút
        </span>
      </div>

      {/* Clock columns */}

      <div className="exact-time-picker__columns">
        {/* Hour */}

        <div className="exact-time-picker__column">
          {HOURS.map(
            (hour) => {
              const selected =
                hour ===
                selectedHour;

              return (
                <button
                  key={
                    hour
                  }
                  ref={(
                    node,
                  ) => {
                    hourRefs.current[
                      hour
                    ] =
                      node;
                  }}
                  type="button"
                  className={[
                    "exact-time-picker__item",
                    selected
                      ? "exact-time-picker__item--selected"
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    )}
                  onClick={() => {
                    selectHour(
                      hour,
                    );
                  }}
                >
                  <span>
                    {
                      hour
                    }
                  </span>

                  {selected ? (
                    <CheckOutlined />
                  ) : null}
                </button>
              );
            },
          )}
        </div>

        {/* Divider */}

        <div className="exact-time-picker__separator">
          :
        </div>

        {/* Minute */}

        <div className="exact-time-picker__column">
          {MINUTES.map(
            (minute) => {
              const selected =
                minute ===
                selectedMinute;

              return (
                <button
                  key={
                    minute
                  }
                  ref={(
                    node,
                  ) => {
                    minuteRefs.current[
                      minute
                    ] =
                      node;
                  }}
                  type="button"
                  className={[
                    "exact-time-picker__item",
                    selected
                      ? "exact-time-picker__item--selected"
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    )}
                  onClick={() => {
                    selectMinute(
                      minute,
                    );
                  }}
                >
                  <span>
                    {
                      minute
                    }
                  </span>

                  {selected ? (
                    <CheckOutlined />
                  ) : null}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Footer */}

      <div className="exact-time-picker__footer">
        <ClockCircleOutlined />

        <span>
          Có thể nhập trực
          tiếp theo định dạng
        </span>

        <strong>
          HH:mm
        </strong>
      </div>
    </div>
  );

  /* ========================================
     Render
  ======================================== */

  return (
    <Popover
      open={
        open &&
        !disabled
      }
      trigger="click"
      placement="bottomLeft"
      content={
        popupContent
      }
      overlayClassName="exact-time-picker__overlay"
      onOpenChange={(
        nextOpen,
      ) => {
        if (
          disabled
        ) {
          return;
        }

        setOpen(
          nextOpen,
        );
      }}
    >
      <div
        className={[
          "exact-time-picker",
          className,
        ]
          .filter(
            Boolean,
          )
          .join(" ")}
      >
        <Input
          value={
            value || ""
          }
          disabled={
            disabled
          }
          placeholder={
            placeholder
          }
          maxLength={5}
          inputMode="numeric"
          autoComplete="off"
          suffix={
            <ClockCircleOutlined className="exact-time-picker__clock-icon" />
          }
          onFocus={() => {
            if (
              !disabled
            ) {
              setOpen(
                true,
              );
            }
          }}
          onChange={
            handleInputChange
          }
          onBlur={
            normalizeInput
          }
          onPressEnter={
            handlePressEnter
          }
        />
      </div>
    </Popover>
  );
}

ExactTimePicker.propTypes = {
  value:
    PropTypes.string,

  onChange:
    PropTypes.func,

  disabled:
    PropTypes.bool,

  placeholder:
    PropTypes.string,

  className:
    PropTypes.string,
};

ExactTimePicker.defaultProps = {
  value: undefined,

  onChange: undefined,

  disabled: false,

  placeholder:
    "HH:mm",

  className: undefined,
};

export default ExactTimePicker;