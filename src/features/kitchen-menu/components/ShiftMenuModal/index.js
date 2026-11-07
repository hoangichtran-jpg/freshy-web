import React from "react";

import PropTypes from "prop-types";

import { Button, Checkbox } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import { CloseSquareOutlined } from "@ant-design/icons";

import AppButton from "../../../../shared/components/AppButton";

import SearchInput from "../../../../shared/components/SearchInput";

import EmptyState from "../../../../shared/components/EmptyState";

import "./ShiftMenuModal.scss";


function ShiftMenuModal({
  open,

  menuOptions,
  filteredMenuOptions,

  selectedMenus,
  selectedValues,
  hiddenMenus,

  menuQuery,

  isAllFilteredSelected,
  isIndeterminate,

  onQueryChange,
  onToggleAll,
  onClearSelection,
  onToggleHidden,
  onToggleOne,

  onNext,
  onBack,
  onCancel,
}) {
  return (
    <AppModal
      open={open}
      width={640}
      footer={
        <div className="shift-menu-modal__footer">
          <Button
            className="shift-menu-modal__back"
            onClick={onBack}
          >
            Quay lại
          </Button>

          <AppButton
            disabled={
              selectedMenus.length ===
              0
            }
            onClick={onNext}
          >
            Tiếp tục
          </AppButton>
        </div>
      }
      title={
        <div className="shift-menu-modal__heading">
          <div className="shift-menu-modal__title">
            Chọn thực đơn cho ca
          </div>

          <div className="shift-menu-modal__step">
            Bước 1/2
          </div>
        </div>
      }
      onCancel={onCancel}
      maskClosable={false}
      wrapClassName="shift-menu-modal"
    >
      <div className="shift-menu-modal__body">
        <div className="shift-menu-modal__toolbar">
          <SearchInput
            size="md"
            allowClear
            placeholder="Tìm thực đơn..."
            value={menuQuery}
            onChange={(event) =>
              onQueryChange(
                event.target.value,
              )
            }
            className="shift-menu-modal__search"
          />

          <div className="shift-menu-modal__toolbar-actions">
            <Checkbox
              indeterminate={
                isIndeterminate
              }
              checked={
                isAllFilteredSelected
              }
              onChange={(event) =>
                onToggleAll(
                  event.target
                    .checked,
                )
              }
            >
              Chọn tất cả
            </Checkbox>

            <Button
              type="text"
              size="small"
              icon={
                <CloseSquareOutlined />
              }
              disabled={
                selectedMenus.length ===
                0
              }
              onClick={
                onClearSelection
              }
              className="shift-menu-modal__clear"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>


        <div className="shift-menu-modal__summary">
          <span>
            {
              filteredMenuOptions.length
            }
            /
            {
              menuOptions.length
            }{" "}
            thực đơn
          </span>

          <strong>
            {
              selectedMenus.length
            }{" "}
            đã chọn
          </strong>
        </div>


        <div className="shift-menu-modal__list">
          {filteredMenuOptions.length ===
          0 ? (
            <EmptyState
              image="simple"
              description="Không có thực đơn phù hợp"
              className="shift-menu-modal__empty"
            />
          ) : (
            filteredMenuOptions.map(
              (menu) => {
                const checked =
                  selectedValues.has(
                    menu.value,
                  );

                const hidden =
                  hiddenMenus.has(
                    menu.value,
                  );

                const items =
                  menu.items ||
                  [];

                const itemCount =
                  items.length;

                const preview =
                  items
                    .slice(
                      0,
                      2,
                    )
                    .map(
                      (item) =>
                        item.name,
                    )
                    .filter(Boolean)
                    .join(" · ");


                return (
                  <div
                    key={
                      menu.value
                    }
                    className={[
                      "shift-menu-modal__menu",

                      checked
                        ? "shift-menu-modal__menu--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="shift-menu-modal__menu-main">
                      <Checkbox
                        checked={
                          checked
                        }
                        onChange={(event) =>
                          onToggleOne(
                            menu,
                            event.target
                              .checked,
                          )
                        }
                      />

                      <div className="shift-menu-modal__menu-info">
                        <div className="shift-menu-modal__menu-name">
                          {
                            menu.label
                          }
                        </div>

                        <div className="shift-menu-modal__menu-meta">
                          <span>
                            {
                              itemCount
                            }{" "}
                            món
                          </span>

                          {preview && (
                            <>
                              <span className="shift-menu-modal__dot">
                                •
                              </span>

                              <span className="shift-menu-modal__preview">
                                {
                                  preview
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>


                    <Checkbox
                      checked={
                        hidden
                      }
                      disabled={
                        !checked
                      }
                      onChange={(event) =>
                        onToggleHidden(
                          menu.value,
                          event.target
                            .checked,
                        )
                      }
                      className="shift-menu-modal__hidden"
                    >
                      Ẩn menu
                    </Checkbox>
                  </div>
                );
              },
            )
          )}
        </div>
      </div>
    </AppModal>
  );
}


ShiftMenuModal.propTypes = {
  open:
    PropTypes.bool,

  menuOptions:
    PropTypes.array,

  filteredMenuOptions:
    PropTypes.array,

  selectedMenus:
    PropTypes.array,

  selectedValues:
    PropTypes.instanceOf(
      Set,
    ).isRequired,

  hiddenMenus:
    PropTypes.instanceOf(
      Set,
    ).isRequired,

  menuQuery:
    PropTypes.string,

  isAllFilteredSelected:
    PropTypes.bool,

  isIndeterminate:
    PropTypes.bool,

  onQueryChange:
    PropTypes.func.isRequired,

  onToggleAll:
    PropTypes.func.isRequired,

  onClearSelection:
    PropTypes.func.isRequired,

  onToggleHidden:
    PropTypes.func.isRequired,

  onToggleOne:
    PropTypes.func.isRequired,

  onNext:
    PropTypes.func.isRequired,

  onBack:
    PropTypes.func.isRequired,

  onCancel:
    PropTypes.func.isRequired,
};


ShiftMenuModal.defaultProps = {
  open: false,
  menuOptions: [],
  filteredMenuOptions: [],
  selectedMenus: [],
  menuQuery: "",
  isAllFilteredSelected: false,
  isIndeterminate: false,
};


export default ShiftMenuModal;
