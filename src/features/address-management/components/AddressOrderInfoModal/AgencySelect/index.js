import React, { useMemo, useState } from "react";

import PropTypes from "prop-types";

import { CheckOutlined, DownOutlined } from "@ant-design/icons";

import { Popover } from "antd";

import SearchInput from "../../../../../shared/components/SearchInput";

import EmptyState from "../../../../../shared/components/EmptyState";

import "./AgencySelect.scss";


const normalizeSearchText = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

function AgencySelect({
  value,
  onChange,
  options,
  disabled,
  placeholder,
  className,
}) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  /* ========================================
     Selected agency
  ======================================== */

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  /* ========================================
     Filter
  ======================================== */

  const filteredOptions = useMemo(() => {
    const keyword = normalizeSearchText(search);

    if (!keyword) {
      return options;
    }

    return options.filter((option) => {
      const searchable = normalizeSearchText(
        [option.label, option.phone, option.searchText]
          .filter(Boolean)
          .join(" "),
      );

      return searchable.includes(keyword);
    });
  }, [options, search]);

  /* ========================================
     Select
  ======================================== */

  const handleSelect = (option) => {
    onChange?.(option.value);

    setSearch("");

    setOpen(false);
  };

  /* ========================================
     Popup
  ======================================== */

  const content = (
    <div className="agency-picker__panel">
      <div className="agency-picker__search-wrap">
        <SearchInput
          size="md"
          autoFocus
          allowClear
          value={search}
          placeholder="Tìm theo tên hoặc số điện thoại"
          className="agency-picker__search"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          onKeyDown={(event) => {
            /*
             * Không để key event
             * bubble ra form/modal.
             */
            event.stopPropagation();
          }}
        />
      </div>

      <div className="agency-picker__list">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "agency-picker__option",
                  selected ? "agency-picker__option--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  handleSelect(option);
                }}
              >
                <div className="agency-picker__option-content">
                  <span className="agency-picker__name">{option.label}</span>

                  {option.phone ? (
                    <span className="agency-picker__phone">{option.phone}</span>
                  ) : null}
                </div>

                {selected ? (
                  <CheckOutlined className="agency-picker__check" />
                ) : null}
              </button>
            );
          })
        ) : (
          <div className="agency-picker__empty">
            <EmptyState
              image="simple"
              description="Không tìm thấy đại lý"
            />
          </div>
        )}
      </div>
    </div>
  );

  /* ========================================
     Render
  ======================================== */

  return (
    <Popover
      open={open && !disabled}
      trigger="click"
      placement="bottomLeft"
      content={content}
      overlayClassName="agency-picker__overlay"
      onOpenChange={(nextOpen) => {
        if (disabled) {
          return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
          setSearch("");
        }
      }}
    >
      <button
        type="button"
        disabled={disabled}
        className={[
          "agency-picker__trigger",
          open ? "agency-picker__trigger--open" : "",
          disabled ? "agency-picker__trigger--disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "agency-picker__value",
            !selectedOption ? "agency-picker__value--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {selectedOption?.label || placeholder}
        </span>

        <DownOutlined className="agency-picker__arrow" />
      </button>
    </Popover>
  );
}

AgencySelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  onChange: PropTypes.func,

  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,

      label: PropTypes.string.isRequired,

      phone: PropTypes.string,

      searchText: PropTypes.string,
    }),
  ),

  disabled: PropTypes.bool,

  placeholder: PropTypes.string,

  className: PropTypes.string,
};

AgencySelect.defaultProps = {
  value: undefined,

  onChange: undefined,

  options: [],

  disabled: false,

  placeholder: "Chọn đại lý",

  className: undefined,
};

export default AgencySelect;
