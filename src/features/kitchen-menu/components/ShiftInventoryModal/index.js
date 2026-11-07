import React from "react";
import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import { InfoCircleOutlined } from "@ant-design/icons";

import AppButton from "../../../../shared/components/AppButton";

import InventoryItemCards from "../../../shift-inventory/components/InventoryItemCards";

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

        <InventoryItemCards
          mode="open"
          loading={loading}
          items={items.map((item) => ({
            itemId: item.itemId,
            itemName: item.name,
            menuId: item.menuId,
            menuIds: item.menuIds,
            initialQuantity: initialQty[item.itemId],
            quantitative: initialGram[item.itemId],
            toppingGroups: (item.toppingDTO || []).map((group, groupIndex) => ({
              groupId: groupIndex,
              groupName: group.name,
              toppings: (group.toppings || [])
                .filter((t) => t.isActive)
                .map((t) => {
                  const key = getToppingKey(
                    item.itemId,
                    groupIndex,
                    t.toppingId,
                  );
                  return {
                    toppingId: t.toppingId,
                    toppingName: t.toppingName,
                    quantitative: toppingGram[key] ?? 0,
                    targetItemId: ingredientMap[key],
                  };
                }),
            })),
          }))}
          onItemChange={(id, field, value) =>
            field === "initialQuantity"
              ? onQuantityChange(id, value)
              : onGramChange(id, value)
          }
          onToppingChange={(itemId, groupIndex, toppingId, field, value) => {
            const key = getToppingKey(itemId, groupIndex, toppingId);
            if (field === "quantitative") {
              onToppingGramChange(key, value);
            } else {
              onIngredientChange(key, value);
            }
          }}
        />
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
