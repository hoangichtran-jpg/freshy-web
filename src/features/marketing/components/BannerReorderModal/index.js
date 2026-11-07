import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";

import { Button } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import { HolderOutlined, PictureOutlined } from "@ant-design/icons";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import EmptyState from "../../../../shared/components/EmptyState";

import "./BannerReorderModal.scss";


/* ========================================
   Sortable row
======================================== */

function SortableBanner({ banner, position }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: banner.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "banner-reorder__item",

        isDragging ? "banner-reorder__item--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        transform: CSS.Transform.toString(transform),

        transition,
      }}
    >
      <button
        type="button"
        className="banner-reorder__handle"
        aria-label={`Di chuyển ${banner.title || "banner"}`}
        {...attributes}
        {...listeners}
      >
        <HolderOutlined />
      </button>

      <span className="banner-reorder__position">#{position}</span>

      <div className="banner-reorder__thumbnail">
        {banner.imageUrl ? (
          <img src={banner.imageUrl} alt={banner.title || "Banner quảng cáo"} />
        ) : (
          <PictureOutlined />
        )}
      </div>

      <div className="banner-reorder__info">
        <strong>{banner.title || "Chưa có tiêu đề"}</strong>

        <span>Đang hiển thị</span>
      </div>
    </div>
  );
}

SortableBanner.propTypes = {
  banner: PropTypes.object.isRequired,

  position: PropTypes.number.isRequired,
};

/* ========================================
   Modal
======================================== */

function BannerReorderModal({ open, banners, saving, onCancel, onSave }) {
  const [orderedBanners, setOrderedBanners] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ========================================
     Reset whenever modal opens
  ======================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setOrderedBanners(
      [...banners].sort(
        (first, second) =>
          (Number(first.sortOrder) || 0) - (Number(second.sortOrder) || 0),
      ),
    );
  }, [open, banners]);

  /* ========================================
     Drag end
  ======================================== */

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }

    setOrderedBanners((current) => {
      const oldIndex = current.findIndex((banner) => banner.id === active.id);

      const newIndex = current.findIndex((banner) => banner.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  };

  /* ========================================
     Save
  ======================================== */

  const handleSave = () => {
    onSave(
      orderedBanners.map((banner, index) => ({
        id: banner.id,

        sortOrder: index,
      })),
    );
  };

  return (
    <AppModal
      open={open}
      width={680}
      title={null}
      footer={null}
      className="banner-reorder-modal"
      closable={!saving}
      maskClosable={!saving}
      onCancel={onCancel}
    >
      <div className="banner-reorder__header">
        <span className="banner-reorder__eyebrow">Thứ tự hiển thị</span>

        <h2>Sắp xếp banner</h2>

        <p>Kéo banner để thay đổi thứ tự khách hàng nhìn thấy.</p>
      </div>

      <div className="banner-reorder__body">
        {orderedBanners.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedBanners.map((banner) => banner.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="banner-reorder__list">
                {orderedBanners.map((banner, index) => (
                  <SortableBanner
                    key={banner.id}
                    banner={banner}
                    position={index + 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState
            image="simple"
            description="Chưa có banner đang hiển thị"
          />
        )}
      </div>

      <div className="banner-reorder__footer">
        <Button disabled={saving} onClick={onCancel}>
          Hủy
        </Button>

        <Button
          type="primary"
          loading={saving}
          disabled={orderedBanners.length < 2}
          className="banner-reorder__save"
          onClick={handleSave}
        >
          Lưu thứ tự
        </Button>
      </div>
    </AppModal>
  );
}

BannerReorderModal.propTypes = {
  open: PropTypes.bool,

  banners: PropTypes.arrayOf(PropTypes.object),

  saving: PropTypes.bool,

  onCancel: PropTypes.func.isRequired,

  onSave: PropTypes.func.isRequired,
};

BannerReorderModal.defaultProps = {
  open: false,

  banners: [],

  saving: false,
};

export default BannerReorderModal;
