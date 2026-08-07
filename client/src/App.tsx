import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FleetMonitor } from './pages/admin/FleetMonitor';
import { LiveOperations } from './pages/admin/LiveOperations';
import { AllManifests } from './pages/admin/AllManifests';
import { ClientRequests } from './pages/admin/ClientRequests';
import { ManifestCreate } from './pages/admin/ManifestCreate';
import { Settings as SettingsPage } from './pages/admin/Settings';
// Client
import { ClientDashboard } from './pages/client/ClientDashboard';
import { PlaceOrder } from './pages/client/PlaceOrder';
import { TrackShipment } from './pages/client/TrackShipment';
import { ClientInvoices } from './pages/client/ClientInvoices';
// Driver
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { ActiveDelivery } from './pages/driver/ActiveDelivery';
// Executive
import { ExecutiveAnalytics } from './pages/executive/ExecutiveAnalytics';

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
          <Route path="/admin/manifests/new" element={<ManifestCreate />} />
          <Route path="/admin/settings" element={<SettingsPage />} />

          {/* Client */}
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/place-order" element={<PlaceOrder />} />
            <Route path="/client/track" element={<TrackShipment />} />
            <Route path="/client/invoices" element={<ClientInvoices />} />
          </Route>

          {/* Driver */}
          <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/driver/delivery/:id" element={<ActiveDelivery />} />
          </Route>

          {/* Executive */}
          <Route element={<ProtectedRoute allowedRoles={['executive']} />}>
            <Route path="/executive/analytics" element={<ExecutiveAnalytics />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
