import React, { useEffect, useMemo, useState } from "react";

import { Button, Card } from "antd";

import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import AppButton from "../../../../shared/components/AppButton";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import {
  BannerCreateModal,
  BannerPreviewModal,
  BannerReorderModal,
  BannerStats,
  BannerTable,
  BannerToolbar,
} from "../../components";

import { useBannerManagement } from "../../hooks";

import "./MarketingPage.scss";

/* ========================================
   Helpers
======================================== */

const didRefreshSucceed = (result) => Boolean(result?.ok || result?.stale);

const getSortOrder = (banner) => {
  const value = Number(banner?.sortOrder);

  return Number.isFinite(value) ? value : 0;
};

/* ========================================
   Page
======================================== */

function MarketingPage() {
  /* ========================================
     Server state
  ======================================== */

  const {
    banners,

    loading,
    loadError,

    creating,

    reordering,

    processingBannerId,
    processingAction,

    refresh,
    clearLoadError,

    createBanner,
    toggleBannerVisibility,
    deleteBanner,
    reorderActiveBanners,
  } = useBannerManagement();

  /* ========================================
     Create modal
  ======================================== */

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  /* ========================================
     Reorder modal
  ======================================== */

  const [isReorderOpen, setIsReorderOpen] = useState(false);

  /* ========================================
     Preview modal
  ======================================== */

  const [previewBanner, setPreviewBanner] = useState(null);

  /* ========================================
     Search
  ======================================== */

  const [searchText, setSearchText] = useState("");

  /* ========================================
     Delete confirmation
  ======================================== */

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ========================================
     Load error feedback
  ======================================== */

  useEffect(() => {
    if (!loadError) {
      return;
    }

    toast.error({
      title: "Không thể tải danh sách quảng cáo",

      description: getErrorDescription(loadError),
    });

    clearLoadError();
  }, [loadError, clearLoadError]);

  /* ========================================
     Stats
  ======================================== */

  const stats = useMemo(() => {
    const total = banners.length;

    const active = banners.filter((banner) => Boolean(banner.active)).length;

    return {
      total,

      active,

      inactive: total - active,
    };
  }, [banners]);

  /* ========================================
     Active banners ordered by sortOrder

     Đây là source cho reorder modal.
  ======================================== */

  const activeBanners = useMemo(
    () =>
      [...banners]
        .filter((banner) => Boolean(banner.active))
        .sort((first, second) => getSortOrder(first) - getSortOrder(second)),
    [banners],
  );

  /* ========================================
     Display position map

     sortOrder là persistence detail.

     UI hiển thị:
     #1
     #2
     #3

     Hidden banner:
     —
  ======================================== */

  const displayPositionById = useMemo(() => {
    return new Map(
      activeBanners.map((banner, index) => [banner.id, index + 1]),
    );
  }, [activeBanners]);

  /* ========================================
     Search result

     Toolbar chỉ search title.

     Column filter/sort do BannerTable xử lý.
  ======================================== */

  const filteredBanners = useMemo(() => {
    const keyword = searchText.trim().toLocaleLowerCase("vi");

    return banners
      .filter((banner) => {
        if (!keyword) {
          return true;
        }

        return String(banner?.title || "")
          .toLocaleLowerCase("vi")
          .includes(keyword);
      })
      .map((banner) => ({
        ...banner,

        displayPosition: banner.active
          ? (displayPositionById.get(banner.id) ?? null)
          : null,
      }));
  }, [banners, searchText, displayPositionById]);

  /* ========================================
     Refresh
  ======================================== */

  const handleRefresh = () => {
    refresh();
  };

  /* ========================================
     Create modal
  ======================================== */

  const handleOpenCreateModal = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (creating) {
      return;
    }

    setIsCreateOpen(false);
  };

  /* ========================================
     Create banner

     User không còn nhập sortOrder.

     Hook tự xác định vị trí cuối
     của active sequence.
  ======================================== */

  const handleCreateBanner = async ({ title, file }) => {
    try {
      const result = await createBanner({
        title,
        file,
      });

      if (!result?.ok) {
        return;
      }

      /*
       * Mutation thành công.
       */
      setIsCreateOpen(false);

      /*
       * Create vẫn refresh vì cần lấy
       * banner mới đầy đủ từ backend.
       */
      const refreshResult = await refresh({
        reportError: false,
      });

      toast.success({
        title: "Thêm quảng cáo thành công",

        description: didRefreshSucceed(refreshResult)
          ? "Quảng cáo mới đã được thêm vào cuối danh sách hiển thị."
          : "Quảng cáo đã được tạo nhưng danh sách chưa thể làm mới. Hãy bấm Làm mới để tải lại dữ liệu.",
      });
    } catch (error) {
      toast.error({
        title: "Không thể tạo quảng cáo",

        description: getErrorDescription(error),
      });
    }
  };

  /* ========================================
     Preview
  ======================================== */

  const handlePreviewBanner = (banner) => {
    setPreviewBanner(banner);
  };

  const handleClosePreview = () => {
    setPreviewBanner(null);
  };

  /* ========================================
     Toggle visibility

     Backend success
     → hook patch đúng row local.

     Không refresh toàn bộ table.
  ======================================== */

  const handleToggleVisibility = async (banner) => {
    try {
      const result = await toggleBannerVisibility(banner);

      if (!result) {
        return;
      }

      /*
       * Nếu banner đang preview,
       * update trạng thái ngay trong
       * preview object để tránh stale UI.
       */
      setPreviewBanner((current) => {
        if (!current || current.id !== banner.id) {
          return current;
        }

        return {
          ...current,

          active: result.active,
        };
      });

      toast.success({
        title: result.active ? "Đã hiển thị quảng cáo" : "Đã ẩn quảng cáo",

        description: result.active
          ? "Quảng cáo đã được thêm vào danh sách đang hiển thị."
          : "Quảng cáo đã được tạm ẩn khỏi khách hàng.",
      });
    } catch (error) {
      toast.error({
        title: "Không thể cập nhật trạng thái",

        description: getErrorDescription(error),
      });
    }
  };

  /* ========================================
     Reorder
  ======================================== */

  const handleOpenReorder = () => {
    if (activeBanners.length < 2) {
      return;
    }

    setIsReorderOpen(true);
  };

  const handleCloseReorder = () => {
    if (reordering) {
      return;
    }

    setIsReorderOpen(false);
  };

  const handleSaveBannerOrder = async (orderedBanners) => {
    try {
      const result = await reorderActiveBanners(orderedBanners);

      if (result?.ok === false) {
        return;
      }

      setIsReorderOpen(false);

      toast.success({
        title: "Đã cập nhật thứ tự",

        description: "Thứ tự banner hiển thị đã được lưu.",
      });
    } catch (error) {
      toast.error({
        title: "Không thể lưu thứ tự",

        description: getErrorDescription(error),
      });
    }
  };

  /* ========================================
     Open delete confirmation
  ======================================== */

  const handleOpenDelete = (banner) => {
    setDeleteTarget(banner);
  };

  /* ========================================
     Delete loading
  ======================================== */

  const deleteConfirmLoading =
    Boolean(deleteTarget) &&
    processingBannerId === deleteTarget?.id &&
    processingAction === "delete";

  /* ========================================
     Close delete confirmation
  ======================================== */

  const handleCloseDelete = () => {
    if (deleteConfirmLoading) {
      return;
    }

    setDeleteTarget(null);
  };

  /* ========================================
     Delete banner
  ======================================== */

  const handleDeleteBanner = async () => {
    if (!deleteTarget) {
      return;
    }

    const banner = deleteTarget;

    try {
      const result = await deleteBanner(banner);

      if (!result) {
        return;
      }

      /*
       * Mutation thành công.
       */
      setDeleteTarget(null);

      /*
       * Nếu banner đang preview
       * chính là banner vừa xóa.
       */
      if (previewBanner?.id === banner.id) {
        setPreviewBanner(null);
      }

      /*
       * Delete vẫn refresh để đảm bảo
       * list / position sequence đồng bộ
       * sau destructive mutation.
       */
      const refreshResult = await refresh({
        reportError: false,
      });

      toast.success({
        title: "Đã xóa quảng cáo",

        description: didRefreshSucceed(refreshResult)
          ? "Quảng cáo đã được xóa khỏi danh sách."
          : "Quảng cáo đã được xóa nhưng danh sách chưa thể làm mới. Hãy bấm Làm mới để tải lại dữ liệu.",
      });
    } catch (error) {
      toast.error({
        title: "Không thể xóa quảng cáo",

        description: getErrorDescription(error),
      });
    }
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="marketing-page">
      {/* ========================================
          Header
      ======================================== */}

      <ManagementPageHeader
        title="Quảng cáo"
        description="Quản lý banner quảng cáo hiển thị tới khách hàng."
        actions={
          <div className="marketing-page__header-actions">
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              className="marketing-page__refresh"
              onClick={handleRefresh}
            >
              Làm mới
            </Button>

            <AppButton
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Thêm quảng cáo
            </AppButton>
          </div>
        }
      />

      {/* ========================================
          Stats
      ======================================== */}

      <BannerStats
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
      />

      {/* ========================================
          Banner list
      ======================================== */}

      <Card className="banner-table-card">
        <BannerToolbar
          searchValue={searchText}
          filteredCount={filteredBanners.length}
          totalCount={banners.length}
          reorderDisabled={activeBanners.length < 2}
          onSearchChange={setSearchText}
          onReorder={handleOpenReorder}
        />

        <BannerTable
          banners={filteredBanners}
          loading={loading}
          processingBannerId={processingBannerId}
          processingAction={processingAction}
          onPreview={handlePreviewBanner}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleOpenDelete}
        />
      </Card>

      {/* ========================================
          Create
      ======================================== */}

      <BannerCreateModal
        open={isCreateOpen}
        submitting={creating}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateBanner}
      />

      {/* ========================================
          Reorder active banners
      ======================================== */}

      <BannerReorderModal
        open={isReorderOpen}
        banners={activeBanners}
        saving={reordering}
        onCancel={handleCloseReorder}
        onSave={handleSaveBannerOrder}
      />

      {/* ========================================
          Preview
      ======================================== */}

      <BannerPreviewModal
        open={Boolean(previewBanner)}
        banner={previewBanner}
        onClose={handleClosePreview}
      />

      {/* ========================================
          Delete confirmation
      ======================================== */}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xóa quảng cáo?"
        description={
          deleteTarget
            ? `Bạn sắp xóa "${deleteTarget.title || "quảng cáo này"}". Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xóa quảng cáo"
        cancelText="Hủy"
        danger
        loading={deleteConfirmLoading}
        onConfirm={handleDeleteBanner}
        onCancel={handleCloseDelete}
      />
    </div>
  );
}

export default MarketingPage;
