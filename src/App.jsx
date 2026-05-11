import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminStore } from './store/adminStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import TenantDetailPage from './pages/TenantDetailPage';
import BillingPage from './pages/BillingPage';
import WhatsAppPage from './pages/WhatsAppPage';
import SupportPage from './pages/SupportPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditPage from './pages/AuditPage';
import SystemPage from './pages/SystemPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import FeatureSpecPage from './pages/FeatureSpecPage';

const Guard = ({ children }) => {
  const token = useAdminStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="tenants"       element={<TenantsPage />} />
          <Route path="tenants/:id"   element={<TenantDetailPage />} />
          <Route path="whatsapp"      element={<WhatsAppPage />} />
          <Route path="support"       element={<SupportPage />} />
          <Route path="billing"       element={<BillingPage />} />
          <Route path="analytics"     element={<AnalyticsPage />} />
          <Route path="system"        element={<SystemPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="audit"         element={<AuditPage />} />
          <Route path="feature-spec"  element={<FeatureSpecPage />} />
          <Route path="*"             element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
