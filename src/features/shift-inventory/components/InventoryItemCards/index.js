import React from "react";
import PropTypes from "prop-types";
import { Collapse, Segmented } from "antd";
import AppInputNumber from "../../../../shared/components/AppInputNumber";
import AppSelect from "../../../../shared/components/AppSelect";
import { shareShiftMenu } from "../../utils/menuMembership";
import "./InventoryItemCards.scss";

const OPTIONS = [0, 0.5, 1];

/** Shared UI for opening and editing a shift. No API calls. */
function InventoryItemCards({
  items,
  loading,
  mode,
  onItemChange,
  onToppingChange,
}) {
  return (
    <div className="shift-inventory-modal__scroll">
      {items.map((item) => {
        const options = items
          .filter((candidate) => shareShiftMenu(item, candidate))
          .map((candidate) => ({
            value: candidate.itemId,
            label: candidate.itemName,
          }));
        const groups = (item.toppingGroups || []).filter(
          (g) => (g.toppings || []).length,
        );

        return (
          <section key={item.itemId} className="shift-inventory-modal__item">
            <div className="shift-inventory-modal__item-header">
              <div className="shift-inventory-modal__item-name">
                {item.itemName}
              </div>

              <div className="shift-inventory-modal__main-fields">
                <label className="shift-inventory-modal__field">
                  <span>Số suất</span>
                  <AppInputNumber
                    size="sm"
                    min={1}
                    step={1}
                    precision={0}
                    disabled={loading}
                    value={item.initialQuantity}
                    aria-label={`Số suất ${item.itemName}`}
                    onChange={(v) =>
                      onItemChange(item.itemId, "initialQuantity", v)
                    }
                  />
                </label>

                <label className="shift-inventory-modal__field">
                  <span>Định lượng</span>
                  <AppInputNumber
                    size="sm"
                    min={mode === "edit" ? 0.01 : 0}
                    step={0.1}
                    disabled={loading}
                    value={item.quantitative}
                    aria-label={`Định lượng ${item.itemName}`}
                    onChange={(v) =>
                      onItemChange(item.itemId, "quantitative", v)
                    }
                  />
                </label>

                {mode === "edit" && item.remainingQuantity != null && (
                  <div
                    className="shift-inventory-modal__field inventory-cards__remaining-field"
                    title="Tồn hiện tại, chưa tính thay đổi chưa lưu"
                  >
                    <span>Còn lại</span>
                    <strong className="inventory-cards__remaining-value">
                      {item.remainingQuantity}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {groups.length > 0 && (
              <Collapse ghost className="shift-inventory-modal__collapse">
                <Collapse.Panel
                  key="toppings"
                  header={
                    <div className="shift-inventory-modal__collapse-title">
                      <span>Topping & nguyên liệu</span>
                      <strong>{groups.length} nhóm</strong>
                    </div>
                  }
                >
                  <div className="shift-inventory-modal__groups">
                    {groups.map((group) => (
                      <div
                        key={`${item.itemId}-${group.groupId}`}
                        className="shift-inventory-modal__group"
                      >
                        <div className="shift-inventory-modal__group-name">
                          {group.groupName}
                        </div>

                        <div className="shift-inventory-modal__group-rows">
                          {group.toppings.map((top) => {
                            const q = Number(top.quantitative);
                            const currentTarget = items.find(
                              (candidate) =>
                                String(candidate.itemId) ===
                                String(top.targetItemId),
                            );

                            const hasCurrent = options.some(
                              (option) =>
                                String(option.value) ===
                                String(top.targetItemId),
                            );

                            const selectOptions =
                              currentTarget && !hasCurrent
                                ? [
                                    ...options,
                                    {
                                      value: currentTarget.itemId,
                                      label: currentTarget.itemName,
                                      disabled: true,
                                    },
                                  ]
                                : options;

                            return (
                              <div
                                key={top.toppingId}
                                className="shift-inventory-modal__topping"
                              >
                                <div className="shift-inventory-modal__topping-name">
                                  {top.toppingName}
                                </div>

                                <div className="inventory-cards__topping-qty">
                                  <Segmented
                                    className="shift-inventory-modal__quantitative"
                                    disabled={loading}
                                    value={Number.isFinite(q) ? q : undefined}
                                    options={(mode === "edit" &&
                                    Number.isFinite(q) &&
                                    !OPTIONS.includes(q)
                                      ? [...OPTIONS, q]
                                      : OPTIONS
                                    ).map((v) => ({
                                      value: v,
                                      label: String(v),
                                    }))}
                                    onChange={(v) =>
                                      onToppingChange(
                                        item.itemId,
                                        group.groupId,
                                        top.toppingId,
                                        "quantitative",
                                        v,
                                      )
                                    }
                                  />
                                </div>

                                <AppSelect
                                  size="sm"
                                  className="shift-inventory-modal__ingredient"
                                  showSearch
                                  optionFilterProp="label"
                                  disabled={
                                    loading ||
                                    options.length === 0 ||
                                    (mode === "open" && !(q > 0))
                                  }
                                  options={selectOptions}
                                  placeholder="Trừ vào món"
                                  value={top.targetItemId ?? undefined}
                                  aria-label={`Món trừ tồn của ${top.toppingName}`}
                                  onChange={(v) =>
                                    onToppingChange(
                                      item.itemId,
                                      group.groupId,
                                      top.toppingId,
                                      "targetItemId",
                                      v,
                                    )
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapse.Panel>
              </Collapse>
            )}
          </section>
        );
      })}
    </div>
  );
}

InventoryItemCards.propTypes = {
  items: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  mode: PropTypes.oneOf(["open", "edit"]).isRequired,
  onItemChange: PropTypes.func.isRequired,
  onToppingChange: PropTypes.func.isRequired,
};

export default InventoryItemCards;
