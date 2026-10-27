import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

import HomePage from './user-web/HomePage.jsx';
import BrandListPage from './user-web/Brand_list.jsx';
import BrandDetailPage from './user-web/BrandDetailPage.jsx';
import SuggestionsPage from './user-web/Suggest.jsx';

import AdminDashboard from './admin/AdminDashboard.jsx';
import BrandManagement from './admin/Manage_Brand.jsx';
import BranchManagement from './admin/Branch_manage.jsx';
import SuggestionsManagement from './admin/Sugguest_manage.jsx';
import ApprovalsManagement from './admin/Approve_manage.jsx';
import PageTracker from './analytics/PageTracker.jsx';
/* Map: section trên URL -> trang quản trị tương ứng (đã bỏ menu) */
const ADMIN_PAGES = {
  brands: BrandManagement,
  branches: BranchManagement,
  suggestions: SuggestionsManagement,
  approvals: ApprovalsManagement,
};

const ADMIN_SECTIONS = Object.keys(ADMIN_PAGES);

/* Hook điều hướng chung cho người dùng */
function useUserNav() {
  const nav = useNavigate();
  return (key) => {
    if (key === 'home') return nav('/');
    if (key === 'brands') return nav('/brands');
    if (key === 'suggestions') return nav('/suggestions');
    if (key === 'map') return nav('/map');
    console.info(`Trang "${key}" chưa có.`);
  };
}

/* Hook điều hướng chung cho khu vực Admin */
function useAdminNav() {
  const nav = useNavigate();
  return (key) => {
    if (key === 'dashboard') return nav('/admin');
    if (ADMIN_SECTIONS.includes(key)) return nav(`/admin/${key}`);
    console.info(`Trang quản trị "${key}" chưa có.`);
  };
}

/* 1. Trang Chủ */
function Home({ addRecentBrand }) {
  const nav = useNavigate();
  const go = useUserNav();

  const handleOpenBrand = (id, brandObj) => {
    if (brandObj && addRecentBrand) {
      addRecentBrand(brandObj);
    }
    nav(`/brand/${id}`);
  };

  return <HomePage onNavigate={go} onOpenBrand={handleOpenBrand} />;
}

/* 2. Trang Danh sách Thương hiệu */
function BrandList({ addRecentBrand }) {
  const nav = useNavigate();
  const go = useUserNav();

  const handleSelectBrand = (brand) => {
    if (addRecentBrand) {
      addRecentBrand(brand);
    }
    nav(`/brand/${brand.id}`);
  };

  return <BrandListPage onNavigate={go} onSelectBrand={handleSelectBrand} />;
}

/* 3. Trang Chi tiết Thương hiệu */
function BrandDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const go = useUserNav();

  return (
    <BrandDetailPage
      brandId={id ? Number(id) : undefined}
      onBack={() => nav('/brands')}
      onNavigate={go}
    />
  );
}

/* 4. Trang Đề xuất */
function Suggestions({ recentBrands }) {
  const nav = useNavigate();
  const go = useUserNav();

  return (
    <SuggestionsPage
      recentBrands={recentBrands}
      onSelectBrand={(brand) => nav(`/brand/${brand.id}`)}
      onNavigate={go}
    />
  );
}

/* 5. Khu vực Quản trị Admin */
function Dashboard() {
  return <AdminDashboard onNavigate={useAdminNav()} />;
}

function Management() {
  const { section } = useParams();
  const Page = ADMIN_PAGES[section];
  if (!Page) return <Navigate to="/admin" replace />;
  return <Page onNavigate={useAdminNav()} />;
}

/* Main App Component */
export default function App() {
  // Quản lý danh sách các thương hiệu mà người dùng đã bấm xem gần đây
  const [recentBrands, setRecentBrands] = useState([]);

  const addRecentBrand = (brand) => {
    setRecentBrands((prev) => {
      const exists = prev.some((b) => b.id === brand.id);
      if (exists) return prev;
      return [brand, ...prev].slice(0, 5); // Lưu tối đa 5 thương hiệu mới xem
    });
  };

  return (
    <>
      <PageTracker />

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home addRecentBrand={addRecentBrand} />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/brands" element={<BrandList addRecentBrand={addRecentBrand} />} />
        <Route path="/brand" element={<BrandDetail />} />
        <Route path="/brand/:id" element={<BrandDetail />} />
        <Route path="/suggestions" element={<Suggestions recentBrands={recentBrands} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/:section" element={<Management />} />

        {/* Wildcard Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
