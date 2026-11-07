import React from "react";
import PropTypes from "prop-types";

import { Button, Collapse, Segmented } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import AppSelect from "../../../../shared/components/AppSelect";

import { InfoCircleOutlined } from "@ant-design/icons";

import AppButton from "../../../../shared/components/AppButton";
import AppInputNumber from "../../../../shared/components/AppInputNumber";

import "./ShiftInventoryModal.scss";

const { Panel } = Collapse;

const getToppingKey = (itemId, groupIndex, toppingId) =>
  `${itemId}-${groupIndex}-${toppingId}`;

function ShiftInventoryModal({
  open,

  items,

  initialQty,
  initialGram,
  toppingGram,
  ingredientMap,

  loading,

  onQuantityChange,
  onGramChange,
  onToppingGramChange,
  onIngredientChange,

  onConfirm,
  onBack,
  onCancel,
}) {
  return (
    <AppModal
      open={open}
      width={1140}
      footer={
        <div className="shift-inventory-modal__footer">
          <Button
            disabled={loading}
            onClick={onBack}
            className="shift-inventory-modal__back"
          >
            Quay lại
          </Button>

          <AppButton loading={loading} onClick={onConfirm}>
            Mở ca
          </AppButton>
        </div>
      }
      title={
        <div className="shift-inventory-modal__heading">
          <div className="shift-inventory-modal__title">
            Thiết lập tồn kho đầu ca
          </div>

          <div className="shift-inventory-modal__step">Bước 2/2</div>
        </div>
      }
      onCancel={loading ? undefined : onCancel}
      closable={!loading}
      maskClosable={false}
      keyboard={!loading}
      wrapClassName="shift-inventory-modal"
    >
      <div className="shift-inventory-modal__body">
        <div className="shift-inventory-modal__intro">
          <div className="shift-inventory-modal__intro-icon">
            <InfoCircleOutlined />
          </div>

          <div>
            <strong>Tồn kho ban đầu</strong>

            <span>
              Nhập số suất và định lượng ban đầu cho {items.length} món trước
              khi mở ca.
            </span>
          </div>
        </div>

        <div className="shift-inventory-modal__scroll">
          {items.map((item) => {
            const activeGroups = (item.toppingDTO || [])
              .map((group, groupIndex) => ({
                ...group,

                groupIndex,

                activeToppings: (group.toppings || []).filter(
                  (topping) => topping.isActive,
                ),
              }))
              .filter((group) => group.activeToppings.length > 0);

            return (
              <section
                key={item.itemId}
                className="shift-inventory-modal__item"
              >
                <div className="shift-inventory-modal__item-header">
                  <div className="shift-inventory-modal__item-name">
                    {item.name}
                  </div>

                  <div className="shift-inventory-modal__main-fields">
                    <label className="shift-inventory-modal__field">
                      <span>Số suất</span>

                      <AppInputNumber
                        size="sm"
                        min={1}
                        value={initialQty[item.itemId]}
                        onChange={(value) =>
                          onQuantityChange(item.itemId, value)
                        }
                      />
                    </label>

                    <label className="shift-inventory-modal__field">
                      <span>Định lượng</span>

                      <AppInputNumber
                        size="sm"
                        min={0}
                        value={initialGram[item.itemId]}
                        onChange={(value) => onGramChange(item.itemId, value)}
                      />
                    </label>
                  </div>
                </div>

                {activeGroups.length > 0 && (
                  <Collapse ghost className="shift-inventory-modal__collapse">
                    <Panel
                      key="toppings"
                      header={
                        <div className="shift-inventory-modal__collapse-title">
                          <span>Topping & nguyên liệu</span>

                          <strong>{activeGroups.length} nhóm</strong>
                        </div>
                      }
                    >
                      <div className="shift-inventory-modal__groups">
                        {activeGroups.map((group) => (
                          <div
                            key={`${item.itemId}-${group.groupIndex}`}
                            className="shift-inventory-modal__group"
                          >
                            <div className="shift-inventory-modal__group-name">
                              {group.name}
                            </div>

                            <div className="shift-inventory-modal__group-rows">
                              {group.activeToppings.map((topping) => {
                                const key = getToppingKey(
                                  item.itemId,
                                  group.groupIndex,
                                  topping.toppingId,
                                );

                                const quantitative = toppingGram[key] ?? 0;

                                return (
                                  <div
                                    key={key}
                                    className="shift-inventory-modal__topping"
                                  >
                                    <div className="shift-inventory-modal__topping-name">
                                      {topping.toppingName}
                                    </div>

                                    <Segmented
                                      value={quantitative}
                                      options={[
                                        {
                                          label: "0",
                                          value: 0,
                                        },
                                        {
                                          label: "0.5",
                                          value: 0.5,
                                        },
                                        {
                                          label: "1",
                                          value: 1,
                                        },
                                      ]}
                                      onChange={(value) =>
                                        onToppingGramChange(key, value)
                                      }
                                      className="shift-inventory-modal__quantitative"
                                    />

                                    <AppSelect
                                      size="sm"
                                      value={ingredientMap[key]}
                                      options={items.map((option) => ({
                                        value: option.itemId,

                                        label: option.name,
                                      }))}
                                      disabled={quantitative <= 0}
                                      placeholder="Trừ vào món"
                                      onChange={(value) =>
                                        onIngredientChange(key, value)
                                      }
                                      className="shift-inventory-modal__ingredient"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </Collapse>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </AppModal>
  );
}

ShiftInventoryModal.propTypes = {
  open: PropTypes.bool,

  items: PropTypes.array,

  initialQty: PropTypes.object,

  initialGram: PropTypes.object,

  toppingGram: PropTypes.object,

  ingredientMap: PropTypes.object,

  loading: PropTypes.bool,

  onQuantityChange: PropTypes.func.isRequired,

  onGramChange: PropTypes.func.isRequired,

  onToppingGramChange: PropTypes.func.isRequired,

  onIngredientChange: PropTypes.func.isRequired,

  onConfirm: PropTypes.func.isRequired,

  onBack: PropTypes.func.isRequired,

  onCancel: PropTypes.func.isRequired,
};

ShiftInventoryModal.defaultProps = {
  open: false,
  items: [],
  initialQty: {},
  initialGram: {},
  toppingGram: {},
  ingredientMap: {},
  loading: false,
};

export default ShiftInventoryModal;
