import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { NotFound } from './pages/NotFound';
import Login from './pages/Login';
// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FleetMonitor } from './pages/admin/FleetMonitor';
import { LiveOperations } from './pages/admin/LiveOperations';
import { AllManifests } from './pages/admin/AllManifests';
import { ClientRequests } from './pages/admin/ClientRequests';
import { ManifestCreate } from './pages/admin/ManifestCreate';
import { Settings as SettingsPage } from './pages/admin/Settings';
import { Invoices as InvoicesPage } from './pages/admin/Invoices';
import { Notifications as NotificationsPage } from './pages/admin/Notifications';
import { Users as UsersPage } from './pages/admin/Users';
// Analytics page is owned by another developer — currently disabled (see pages/admin/Analytics.tsx).
// import { Analytics as AnalyticsPage } from './pages/admin/Analytics';
// Executive
import { ExecutiveAnalytics } from './pages/executive/ExecutiveAnalytics';
// Team placeholders — will be replaced when teammates merge their pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientInvoices from './pages/client/ClientInvoices';
import TrackShipment from './pages/client/TrackShipment';
import PlaceOrder from './pages/client/PlaceOrder';
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveDelivery from './pages/driver/ActiveDelivery';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authenticated — admin can access every role's routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/fleet" element={<FleetMonitor />} />
          <Route path="/admin/live" element={<LiveOperations />} />
          <Route path="/admin/manifests" element={<AllManifests />} />
          <Route path="/admin/requests" element={<ClientRequests />} />
          <Route path="/admin/invoices" element={<InvoicesPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          {/* <Route path="/admin/analytics" element={<AnalyticsPage />} /> */}
          <Route path="/admin/manifests/new" element={<ManifestCreate />} />
          <Route path="/admin/settings" element={<SettingsPage />} />

          {/* Executive */}
          <Route element={<ProtectedRoute allowedRoles={['executive', 'admin']} />}>
            <Route path="/executive/analytics" element={<ExecutiveAnalytics />} />
          </Route>

          {/* Client pages (placeholder — teammates will replace these) */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/invoices" element={<ClientInvoices />} />
            <Route path="/client/track" element={<TrackShipment />} />
            <Route path="/client/order" element={<PlaceOrder />} />
          </Route>

          {/* Driver pages (placeholder — teammates will replace these) */}
          <Route element={<ProtectedRoute allowedRoles={['driver', 'admin']} />}>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/delivery" element={<ActiveDelivery />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
