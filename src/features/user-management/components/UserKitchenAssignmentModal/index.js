import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";

import { Button, Checkbox, Spin } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import AppSelect from "../../../../shared/components/AppSelect";

import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import EmptyState from "../../../../shared/components/EmptyState";

import "./UserKitchenAssignmentModal.scss";


const getFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

const getAssignedKitchenNames = (user) => {
  if (Array.isArray(user?.posName)) {
    return user.posName.filter(Boolean);
  }

  if (user?.posName) {
    return [user.posName];
  }

  return [];
};

function UserKitchenAssignmentModal({
  open,
  user,
  kitchens,
  loading,
  error,
  mutationAction,
  onRetry,
  onAdd,
  onRemove,
  onClose,
}) {
  const [selectedAddIds, setSelectedAddIds] = useState([]);

  const [selectedRemoveIds, setSelectedRemoveIds] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedAddIds([]);

    setSelectedRemoveIds([]);
  }, [open, user]);

  const assignedNames = useMemo(
    () => new Set(getAssignedKitchenNames(user)),
    [user],
  );

  const assignedKitchens = useMemo(
    () => kitchens.filter((kitchen) => assignedNames.has(kitchen?.posName)),
    [assignedNames, kitchens],
  );

  const availableKitchens = useMemo(
    () => kitchens.filter((kitchen) => !assignedNames.has(kitchen?.posName)),
    [assignedNames, kitchens],
  );

  const unresolvedNames = useMemo(() => {
    const resolvedNames = new Set(
      assignedKitchens.map((kitchen) => kitchen.posName),
    );

    return Array.from(assignedNames).filter((name) => !resolvedNames.has(name));
  }, [assignedKitchens, assignedNames]);

  const isMutating = mutationAction !== null;

  return (
    <AppModal
      open={open}
      width={640}
      footer={null}
      maskClosable={!isMutating}
      keyboard={!isMutating}
      closable={!isMutating}
      className="user-kitchen-modal"
      onCancel={onClose}
    >
      <div className="user-kitchen-modal__header">
        <h2>Quản lý bếp</h2>

        <p>{getFullName(user) || user?.phoneNumber || "Người dùng"}</p>
      </div>

      {loading ? (
        <div className="user-kitchen-modal__state">
          <Spin />

          <span>Đang tải danh sách bếp...</span>
        </div>
      ) : error ? (
        <div className="user-kitchen-modal__state">
          <strong>Không thể tải danh sách bếp.</strong>

          <span>Vui lòng kiểm tra kết nối và thử lại.</span>

          <Button icon={<ReloadOutlined />} onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      ) : (
        <div className="user-kitchen-modal__content">
          <section className="user-kitchen-modal__section">
            <div className="user-kitchen-modal__section-heading">
              <div>
                <h3>Bếp đang được phân công</h3>

                <p>Chọn các bếp muốn bỏ khỏi người dùng này.</p>
              </div>

              <span className="user-kitchen-modal__count">
                {assignedNames.size}
              </span>
            </div>

            {assignedKitchens.length > 0 || unresolvedNames.length > 0 ? (
              <>
                <Checkbox.Group
                  value={selectedRemoveIds}
                  className="user-kitchen-modal__checkbox-group"
                  onChange={setSelectedRemoveIds}
                >
                  {assignedKitchens.map((kitchen) => (
                    <Checkbox
                      key={kitchen.posId}
                      value={kitchen.posId}
                      disabled={isMutating}
                      className="user-kitchen-modal__checkbox"
                    >
                      <span className="user-kitchen-modal__kitchen-name">
                        {kitchen.posName}
                      </span>

                      {kitchen.posAddress ? (
                        <span className="user-kitchen-modal__kitchen-address">
                          {kitchen.posAddress}
                        </span>
                      ) : null}
                    </Checkbox>
                  ))}
                </Checkbox.Group>

                {unresolvedNames.map((name) => (
                  <div key={name} className="user-kitchen-modal__unresolved">
                    {name}

                    <span>
                      Không tìm thấy POS ID nên chưa thể bỏ phân công.
                    </span>
                  </div>
                ))}

                <Button
                  danger
                  loading={mutationAction === "remove"}
                  disabled={isMutating || selectedRemoveIds.length === 0}
                  className="user-kitchen-modal__remove"
                  onClick={() => onRemove(selectedRemoveIds)}
                >
                  Bỏ phân công
                </Button>
              </>
            ) : (
              <EmptyState
                image="simple"
                description="Người dùng chưa được phân công bếp."
              />
            )}
          </section>

          <section className="user-kitchen-modal__section">
            <div className="user-kitchen-modal__section-heading">
              <div>
                <h3>Thêm bếp</h3>

                <p>Chọn một hoặc nhiều bếp thuộc tài khoản quản lý hiện tại.</p>
              </div>

              <span className="user-kitchen-modal__count">
                {availableKitchens.length}
              </span>
            </div>

            {availableKitchens.length > 0 ? (
              <>
                <AppSelect
                  size="lg"
                  mode="multiple"
                  allowClear
                  showSearch
                  value={selectedAddIds}
                  disabled={isMutating}
                  optionFilterProp="label"
                  placeholder="Chọn bếp..."
                  notFoundContent="Không tìm thấy bếp phù hợp."
                  className="user-kitchen-modal__select"
                  options={availableKitchens.map((kitchen) => ({
                    value: kitchen.posId,

                    label: kitchen.posAddress
                      ? `${kitchen.posName} · ${kitchen.posAddress}`
                      : kitchen.posName,

                    disabled: kitchen.isActive === false,
                  }))}
                  onChange={setSelectedAddIds}
                />

                <Button
                  icon={<PlusOutlined />}
                  loading={mutationAction === "add"}
                  disabled={isMutating || selectedAddIds.length === 0}
                  className="user-kitchen-modal__add"
                  onClick={() => onAdd(selectedAddIds)}
                >
                  Thêm bếp đã chọn
                </Button>
              </>
            ) : (
              <EmptyState
                image="simple"
                description="Không còn bếp khả dụng để phân công."
              />
            )}
          </section>
        </div>
      )}
    </AppModal>
  );
}

UserKitchenAssignmentModal.propTypes = {
  open: PropTypes.bool.isRequired,

  user: PropTypes.object,

  kitchens: PropTypes.arrayOf(
    PropTypes.shape({
      posId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

      posName: PropTypes.string,

      posAddress: PropTypes.string,

      isActive: PropTypes.bool,
    }),
  ),

  loading: PropTypes.bool,

  error: PropTypes.any,

  mutationAction: PropTypes.oneOf(["add", "remove"]),

  onRetry: PropTypes.func.isRequired,

  onAdd: PropTypes.func.isRequired,

  onRemove: PropTypes.func.isRequired,

  onClose: PropTypes.func.isRequired,
};

UserKitchenAssignmentModal.defaultProps = {
  user: null,

  kitchens: [],

  loading: false,

  error: null,

  mutationAction: null,
};

export default UserKitchenAssignmentModal;
