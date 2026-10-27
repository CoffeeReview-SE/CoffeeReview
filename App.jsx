import { createRoot } from "react-dom/client";
import React, { useState } from "react";

import AdminDashboard from "./apps/admin/AdminDashboard";
import ManagementPage from "./apps/admin/ManagementPage";
import BrandDetailPage from "./apps/user-web/BrandDetailPage";
import HomePage from "./apps/user-web/HomePage";

const screens = [
  ["home", "Trang chủ"],
  ["brand-detail", "Chi tiết thương hiệu"],
  ["admin", "Dashboard"],
  ["management", "Quản lý"],
];

function App() {
  const [screen, setScreen] = useState("home");
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [managementSection, setManagementSection] = useState("brands");

  const openBrand = (brandId) => {
    setSelectedBrandId(brandId);
    setScreen("brand-detail");
  };

  const navigate = (target) => {
    if (target === "dashboard") {
      setScreen("admin");
      return;
    }

    setManagementSection(target);
    setScreen("management");
  };

  let content;
  if (screen === "brand-detail") {
    content = (
      <BrandDetailPage
        brandId={selectedBrandId}
        onBack={() => setScreen("home")}
      />
    );
  } else if (screen === "admin") {
    content = <AdminDashboard onNavigate={navigate} />;
  } else if (screen === "management") {
    content = (
      <ManagementPage
        section={managementSection}
        onNavigate={navigate}
      />
    );
  } else {
    content = <HomePage onOpenBrand={openBrand} />;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: 10,
          background: "#162D22",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {screens.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setScreen(id)}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "9px 12px",
              background: screen === id ? "#D5A85A" : "#315C43",
              color: screen === id ? "#162D22" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {content}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
