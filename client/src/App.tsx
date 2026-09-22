import { Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
// Executive
import ExecutiveAnalytics from './pages/executive/ExecutiveAnalytics';
// Client
import ClientDashboard from './pages/client/ClientDashboard';
import ClientInvoices from './pages/client/ClientInvoices';
import TrackShipment from './pages/client/TrackShipment';
import PlaceOrder from './pages/client/PlaceOrder';
// Driver
import DriverMobileLayout from './components/driver/DriverMobileLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAnalytics from './pages/driver/DriverAnalytics';
import DriverNotifications from './pages/driver/DriverNotifications';
import ActiveDelivery from './pages/driver/ActiveDelivery';

function ActiveDeliveryRoute() {
  const { id } = useParams();
  return <ActiveDelivery manifestId={id!} />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authenticated — admin has full access */}
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
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/manifests/new" element={<ManifestCreate />} />
          <Route path="/admin/settings" element={<SettingsPage />} />

          {/* Executive (standalone page, no sidebar) */}
          <Route element={<ProtectedRoute allowedRoles={['executive', 'admin']} />}>
            <Route path="/executive/analytics" element={<ExecutiveAnalytics />} />
          </Route>

          {/* Client */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/invoices" element={<ClientInvoices />} />
            <Route path="/client/track" element={<TrackShipment />} />
            <Route path="/client/order" element={<PlaceOrder />} />
          </Route>
        </Route>
      </Route>

      {/* Driver — mobile layout (no sidebar/topbar) */}
      <Route element={<ProtectedRoute allowedRoles={['driver', 'admin']} />}>
        <Route element={<DriverMobileLayout />}>
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/analytics" element={<DriverAnalytics />} />
          <Route path="/driver/notifications" element={<DriverNotifications />} />
          <Route path="/driver/delivery/:id" element={<ActiveDeliveryRoute />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
