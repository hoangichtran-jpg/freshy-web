import { ArrowRightOutlined, ClockCircleOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import {
  useAuth,
} from "../../../../shared/auth";

import { HomeQuickActions } from "../../components";

import { HOME_QUICK_ACTIONS } from "../../constants/homeQuickActions";

import "./HomePage.scss";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 11) {
    return "Chào buổi sáng";
  }

  if (hour < 18) {
    return "Chào buổi chiều";
  }

  return "Chào buổi tối";
};

const getTodayLabel = () => {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
};

function HomePage() {
  const navigate = useNavigate();

  const { userAuth, tokenStr, setOpenFormLogin } = useAuth();

  /*
   * Home là public route.
   *
   * Khi chưa đăng nhập:
   * chỉ đóng vai trò landing entry.
   *
   * Không render operational content.
   */
  if (!tokenStr) {
    return (
      <main className="home-page home-page--public">
        <section className="home-public">
          <div className="home-public__content">
            <p className="home-page__eyebrow">Freshy Manager</p>

            <h1 className="home-public__title">
              Một nơi để điều hành hoạt động Freshy.
            </h1>

            <p className="home-public__description">
              Quản lý đơn hàng, bếp, thực đơn và trải nghiệm khách hàng trong
              cùng một workspace.
            </p>

            <button
              type="button"
              className="home-public__login"
              onClick={() => {
                setOpenFormLogin(true);
              }}
            >
              Đăng nhập để bắt đầu
              <ArrowRightOutlined />
            </button>
          </div>

          {/* <div className="home-public__visual" aria-hidden="true">
            <div className="home-public__visual-top">
              <span>OPERATIONS</span>

              <span>MANAGER</span>
            </div>

            <div className="home-public__visual-modules">
              <span>Đơn hàng</span>

              <span>Bếp</span>

              <span>Thực đơn</span>

              <span>Khách hàng</span>
            </div>

            <div className="home-public__visual-brand">
              <strong>Freshy</strong>

              <span>Manager workspace</span>
            </div>
          </div> */}
        </section>
      </main>
    );
  }

  const displayName = userAuth?.userName?.trim();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div>
          <p className="home-page__eyebrow">Freshy Manager</p>

          <h1 className="home-hero__title">
            {getGreeting()}
            {displayName ? `, ${displayName}` : ""}
          </h1>

          <p className="home-hero__description">
            Một nơi để bắt đầu công việc hôm nay.
          </p>
        </div>

        <div className="home-hero__date">
          <ClockCircleOutlined />

          <span>{getTodayLabel()}</span>
        </div>
      </section>

      <section className="home-focus">
        <div className="home-focus__heading">
          <div>
            <p className="home-section__label">Bắt đầu công việc</p>

            <h2>Hôm nay bạn muốn xử lý gì?</h2>
          </div>

          <p>Các khu vực được ưu tiên theo luồng vận hành hằng ngày.</p>
        </div>

        <HomeQuickActions actions={HOME_QUICK_ACTIONS} onNavigate={navigate} />
      </section>

      {/* <section className="home-workspace">
        <div className="home-workspace__aside">
          <span className="home-section__label">Tổng quan</span>

          <h2>Dữ liệu vận hành sẽ xuất hiện khi có nguồn đủ tin cậy.</h2>
        </div>

        <div className="home-workspace__content">
          <p>
            Home hiện không tự tải toàn bộ đơn hàng, đánh giá hay thực đơn chỉ
            để tạo những con số tổng hợp.
          </p>

          <p>
            Các KPI như đơn cần xử lý, doanh thu hôm nay và cảnh báo sẽ được bổ
            sung khi có contract hoặc endpoint phù hợp.
          </p>
        </div>
      </section> */}
    </main>
  );
}

export default HomePage;
