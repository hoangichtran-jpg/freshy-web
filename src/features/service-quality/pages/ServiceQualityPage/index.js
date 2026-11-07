import React, { useEffect, useMemo, useState } from "react";

import { Button } from "antd";

import { ReloadOutlined } from "@ant-design/icons";

import { useAuth } from "../../../../shared/auth";

import { formatPhoneNumberWithRegion } from "../../../../helpers";

import ManagementPageHeader from "../../../../shared/components/ManagementPageHeader";

import toast from "../../../../shared/components/AppToast";

import getErrorDescription from "../../../../shared/utils/getErrorDescription";

import {
  ServiceQualityDetailModal,
  ServiceQualityStats,
  ServiceQualityTable,
  ServiceQualityToolbar,
} from "../../components";

import { useServiceQuality } from "../../hooks";

import "./ServiceQualityPage.scss";

/* ========================================
   Helpers
======================================== */

const isValidScore = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 5
  );
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

const normalizeDigits = (value) => String(value || "").replace(/\D/g, "");

/* ========================================
   Page
======================================== */

function ServiceQualityPage() {
  /* ========================================
     Auth
  ======================================== */

  const { userAuth } = useAuth();

  const managerPhone = userAuth?.userPhone || "";

  /* ========================================
     Server state
  ======================================== */

  const {
    reviews,

    loading,
    loadError,

    refresh,
    clearLoadError,
  } = useServiceQuality(managerPhone);

  /* ========================================
     Presentation state
  ======================================== */

  const [searchText, setSearchText] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);

  /* ========================================
     Error feedback
  ======================================== */

  useEffect(() => {
    if (!loadError) {
      return;
    }

    toast.error({
      title: "Không thể tải đánh giá",

      description: getErrorDescription(
        loadError,
        "Không thể tải dữ liệu chất lượng dịch vụ.",
      ),
    });

    clearLoadError();
  }, [loadError, clearLoadError]);

  /* ========================================
     Stats
  ======================================== */

  const stats = useMemo(() => {
    const validScores = reviews
      .map((review) => review.rateScore)
      .filter(isValidScore);

    const total = reviews.length;

    const averageScore =
      validScores.length > 0
        ? validScores.reduce((sum, score) => sum + score, 0) /
          validScores.length
        : null;

    /*
     * Presentation metric tạm thời.
     *
     * Business threshold chính thức
     * đã được note trong PROJECT_BACKLOG.
     */
    const attentionCount = validScores.filter((score) => score <= 2).length;

    return {
      total,

      averageScore,

      attentionCount,
    };
  }, [reviews]);

  /* ========================================
     Search
  ======================================== */

  const filteredReviews = useMemo(() => {
    const keyword = normalizeText(searchText);

    const digitKeyword = normalizeDigits(searchText);

    if (!keyword) {
      return reviews;
    }

    return reviews.filter((review) => {
      const rawPhone = String(review?.customerPhone || "");

      const formattedPhone = formatPhoneNumberWithRegion(rawPhone) || "";

      const note = normalizeText(review?.rateNote);

      const phoneTextMatch =
        normalizeText(rawPhone).includes(keyword) ||
        normalizeText(formattedPhone).includes(keyword);

      const phoneDigitMatch =
        Boolean(digitKeyword) &&
        (normalizeDigits(rawPhone).includes(digitKeyword) ||
          normalizeDigits(formattedPhone).includes(digitKeyword));

      const noteMatch = note.includes(keyword);

      return phoneTextMatch || phoneDigitMatch || noteMatch;
    });
  }, [reviews, searchText]);

  /* ========================================
     Refresh
  ======================================== */

  const handleRefresh = () => {
    refresh();
  };

  /* ========================================
     Detail
  ======================================== */

  const handleOpenReview = (review) => {
    setSelectedReview(review);
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="service-quality-page">
      {/* ========================================
          Header
      ======================================== */}

      <ManagementPageHeader
        title="Chất lượng dịch vụ"
        description="Theo dõi đánh giá và phản hồi từ khách hàng."
        actions={
          <div className="service-quality-page__header-actions">
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              className="service-quality-page__refresh"
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
          </div>
        }
      />

      {/* ========================================
          Stats
      ======================================== */}

      <ServiceQualityStats
        total={stats.total}
        averageScore={stats.averageScore}
        attentionCount={stats.attentionCount}
      />

      {/* ========================================
          Table area
      ======================================== */}

      <section className="service-quality-page__content">
        <ServiceQualityToolbar
          searchValue={searchText}
          filteredCount={filteredReviews.length}
          totalCount={reviews.length}
          onSearchChange={setSearchText}
        />

        <ServiceQualityTable
          reviews={filteredReviews}
          loading={loading}
          resetPageKey={searchText}
          onReviewClick={handleOpenReview}
        />
      </section>

      {/* ========================================
          Detail modal
      ======================================== */}

      <ServiceQualityDetailModal
        open={Boolean(selectedReview)}
        review={selectedReview}
        onClose={handleCloseReview}
      />
    </div>
  );
}

export default ServiceQualityPage;
