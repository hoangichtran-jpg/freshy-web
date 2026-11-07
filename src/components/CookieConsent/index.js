import React, { useState, useEffect } from "react";
import { Button, Drawer, Typography } from "antd";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái chấp nhận cookie trong localStorage
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Lưu trạng thái chấp nhận cookie
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Người dùng từ chối cookie
    localStorage.setItem("cookieConsent", "false");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Drawer
      placement="bottom"
      closable={false}
      open={showBanner}
      height="auto"
      bodyStyle={{
        backgroundColor: "#333",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
      }}
    >
      <Typography.Text style={{ color: "#fff", margin: 0 }}>
        This website uses cookies to ensure you get the best experience.{" "}
        <a href="/cookie-policy" style={{ color: "#4caf50", textDecoration: "underline" }}>
          Learn more
        </a>
      </Typography.Text>
      <div style={{ display: "flex", gap: "10px" }}>
        <Button type="primary" onClick={handleAccept} style={{ backgroundColor: "#4caf50", border: "none" }}>
          Accept All
        </Button>
        <Button danger onClick={handleDecline}>
          Decline
        </Button>
      </div>
    </Drawer>
  );
};

export default CookieConsent;