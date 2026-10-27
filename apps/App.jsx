import React from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import HomePage from "./user-web/HomePage.jsx";
import BrandDetailPage from "./user-web/BrandDetailPage.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import ManagementPage from "./admin/ManagementPage.jsx";

// Sections that ManagementPage already supports
const ADMIN_SECTIONS = ["brands", "branches", "menu", "languages", "suggestions", "approvals"];

function useUserNav() {
  const nav = useNavigate();
  return key => {
    if (key === "home" || key === "brands") return nav("/");
    console.info(`Trang "${key}" chưa có.`); // map, suggestions, login, search...
  };
}

function useAdminNav() {
  const nav = useNavigate();
  return key => {
    if (key === "dashboard") return nav("/admin");
    if (ADMIN_SECTIONS.includes(key)) return nav(`/admin/${key}`);
    console.info(`Trang quản trị "${key}" chưa có.`); // stats, settings, profile...
  };
}

function Home() {
  const nav = useNavigate();
  const go = useUserNav();
  return <HomePage onNavigate={go} onOpenBrand={id => nav(`/brand/${id}`)} />;
}

function BrandDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const go = useUserNav();
  return <BrandDetailPage brandId={id ? Number(id) : undefined} onBack={() => nav("/")} onNavigate={go} />;
}

function Dashboard() {
  return <AdminDashboard onNavigate={useAdminNav()} />;
}

function Management() {
  const { section } = useParams();
  return <ManagementPage section={section} onNavigate={useAdminNav()} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/brand" element={<BrandDetail />} />
      <Route path="/brand/:id" element={<BrandDetail />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/:section" element={<Management />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
