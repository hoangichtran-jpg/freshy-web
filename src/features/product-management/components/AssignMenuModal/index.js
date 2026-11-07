import React from "react";
import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import AppButton from "../../../../shared/components/AppButton";

import AppSelect from "../../../../shared/components/AppSelect";

import "./AssignMenuModal.scss";



function AssignMenuModal({
  open,
  menu,
  kitchens,
  selectedKitchenId,
  loading,
  kitchensLoading,
  onKitchenChange,
  onCancel,
  onConfirm,
}) {
  return (
    <AppModal
      open={open}
      width={460}
      footer={null}
      closable={
        !loading
      }
      maskClosable={
        !loading
      }
      keyboard={
        !loading
      }
      className="assign-menu-modal"
      onCancel={
        onCancel
      }
    >
      <div className="assign-menu-modal__header">
        <h2 className="assign-menu-modal__title">
          Thêm vào trung tâm
        </h2>

        <p className="assign-menu-modal__subtitle">
          Chọn trung tâm sẽ sử dụng{" "}
          <strong>
            {menu?.menuName ||
              "thực đơn này"}
          </strong>
          .
        </p>
      </div>


      <div className="assign-menu-modal__body">
        <label className="assign-menu-modal__label">
          Trung tâm
        </label>

        <AppSelect
          showSearch
          optionFilterProp="label"
          value={
            selectedKitchenId
          }
          loading={
            kitchensLoading
          }
          placeholder="Chọn trung tâm"
          options={
            kitchens
          }
          className="assign-menu-modal__select"
          onChange={
            onKitchenChange
          }
        />

        {!menu?.isActive ? (
          <div className="assign-menu-modal__warning">
            Chỉ thực đơn đang hoạt động mới có thể thêm vào trung tâm.
          </div>
        ) : null}
      </div>


      <div className="assign-menu-modal__footer">
        <Button
          disabled={
            loading
          }
          className="assign-menu-modal__cancel"
          onClick={
            onCancel
          }
        >
          Hủy
        </Button>

        <AppButton
          loading={
            loading
          }
          disabled={
            !selectedKitchenId ||
            !menu?.isActive
          }
          onClick={
            onConfirm
          }
        >
          Thêm vào trung tâm
        </AppButton>
      </div>
    </AppModal>
  );
}


AssignMenuModal.propTypes = {
  open:
    PropTypes.bool.isRequired,

  menu:
    PropTypes.object,

  kitchens:
    PropTypes.arrayOf(
      PropTypes.shape({
        value:
          PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),

        label:
          PropTypes.node,
      }),
    ),

  selectedKitchenId:
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),

  loading:
    PropTypes.bool,

  kitchensLoading:
    PropTypes.bool,

  onKitchenChange:
    PropTypes.func.isRequired,

  onCancel:
    PropTypes.func.isRequired,

  onConfirm:
    PropTypes.func.isRequired,
};


AssignMenuModal.defaultProps = {
  menu: null,
  kitchens: [],
  selectedKitchenId: null,
  loading: false,
  kitchensLoading: false,
};


export default AssignMenuModal;
