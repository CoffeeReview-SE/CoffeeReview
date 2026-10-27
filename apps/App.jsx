import React from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

import HomePage from './user-web/HomePage.jsx';
<<<<<<< Updated upstream
import BrandListPage from './user-web/Brand_list.jsx'; // Thêm import trang danh sách thương hiệu
=======
import MapPage from './user-web/MapPage.jsx';
>>>>>>> Stashed changes
import BrandDetailPage from './user-web/BrandDetailPage.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import BrandManagement from './admin/Manage_Brand.jsx';
import BranchManagement from './admin/Branch_manage.jsx';
import MenuManagement from './admin/Menu_manage.jsx';
import SuggestionsManagement from './admin/Sugguest_manage.jsx';
import ApprovalsManagement from './admin/Approve_manage.jsx';

/* Map: section trên URL -> trang quản trị tương ứng. */
const ADMIN_PAGES = {
  brands: BrandManagement,
  branches: BranchManagement,
  menu: MenuManagement,
  suggestions: SuggestionsManagement,
  approvals: ApprovalsManagement,
};

/* Định tuyến điều hướng toàn bộ khu admin (dùng chung cho mọi trang). */
const ADMIN_SECTIONS = Object.keys(ADMIN_PAGES);

function useUserNav() {
  const nav = useNavigate();
  return (key) => {
<<<<<<< Updated upstream
    if (key === 'home') return nav('/');
    if (key === 'brands') return nav('/brands'); // Chuyển hướng sang trang danh sách thương hiệu
    console.info(`Trang "${key}" chưa có.`); // map, suggestions, login, search...
=======
    if (key === 'home' || key === 'brands') return nav('/');
    if (key === 'map') return nav('/map');
    console.info(`Trang "${key}" chưa có.`); // suggestions, login, search...
>>>>>>> Stashed changes
  };
}

function useAdminNav() {
  const nav = useNavigate();
  return (key) => {
    if (key === 'dashboard') return nav('/admin');
    if (ADMIN_SECTIONS.includes(key)) return nav(`/admin/${key}`);
    console.info(`Trang quản trị "${key}" chưa có.`); // stats, settings, profile...
  };
}

function Home() {
  const nav = useNavigate();
  const go = useUserNav();
  return <HomePage onNavigate={go} onOpenBrand={(id) => nav(`/brand/${id}`)} />;
}

function BrandList() {
  const nav = useNavigate();
  const go = useUserNav();
  return (
    <BrandListPage
      onNavigate={go}
      onSelectBrand={(brand) => nav(`/brand/${brand.id}`)}
    />
  );
}

function BrandDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const go = useUserNav();
  return (
    <BrandDetailPage
      brandId={id ? Number(id) : undefined}
      onBack={() => nav('/')}
      onNavigate={go}
    />
  );
}

function Dashboard() {
  return <AdminDashboard onNavigate={useAdminNav()} />;
}

function Management() {
  const { section } = useParams();
  const Page = ADMIN_PAGES[section];
  if (!Page) return <Navigate to="/admin" replace />;
  return <Page onNavigate={useAdminNav()} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
<<<<<<< Updated upstream
      <Route path="/brands" element={<BrandList />} /> {/* Thêm route cho trang danh sách thương hiệu */}
=======
      <Route path="/map" element={<MapPage />} />
>>>>>>> Stashed changes
      <Route path="/brand" element={<BrandDetail />} />
      <Route path="/brand/:id" element={<BrandDetail />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/:section" element={<Management />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
