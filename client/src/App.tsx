import { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import PlaceholderPage from './components/shared/PlaceholderPage';
import DriverMobileLayout from './components/driver/DriverMobileLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAnalytics from './pages/driver/DriverAnalytics';
import DriverNotifications from './pages/driver/DriverNotifications';
import ActiveDelivery from './pages/driver/ActiveDelivery';
import ExecutiveAnalytics from './pages/executive/ExecutiveAnalytics';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { useAppDispatch } from './store/store';
import { loadUser } from './store/authSlice';
import { useAuth } from './hooks/useAuth';
import { ROLES, DEFAULT_ROUTES } from './utils/constants';

function ActiveDeliveryRoute() {
  const { id } = useParams();
  return <ActiveDelivery manifestId={id} />;
}

function HomeRedirect() {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Loading…" />;
  }
  return <Navigate to={isAuthenticated && role ? DEFAULT_ROUTES[role] : '/login'} replace />;
}

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (localStorage.getItem('b2b_auth_token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AppShell />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/fleet"
            element={<PlaceholderPage title="Fleet Monitor" description="Live vehicle tracking, capacity, and maintenance status." />}
          />
          <Route
            path="/admin/manifest/create"
            element={<PlaceholderPage title="Create Manifest" description="Multi-step wizard to create and dispatch new freight manifests." />}
          />
          <Route
            path="/admin/live-ops"
            element={<PlaceholderPage title="Live Operations" description="Real-time map view of active routes and deliveries." />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
        <Route element={<AppShell />}>
          <Route
            path="/client/dashboard"
            element={<PlaceholderPage title="Client Dashboard" description="Overview of your orders, shipments, and account activity." />}
          />
          <Route
            path="/client/place-order"
            element={<PlaceholderPage title="Place Order" description="Create a new freight order request." />}
          />
          <Route
            path="/client/track"
            element={<PlaceholderPage title="Track Shipment" description="Real-time shipment tracking by tracking ID." />}
          />
          <Route
            path="/client/invoices"
            element={<PlaceholderPage title="Invoices" description="View and download your billing history." />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
        <Route element={<DriverMobileLayout />}>
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/analytics" element={<DriverAnalytics />} />
          <Route path="/driver/notifications" element={<DriverNotifications />} />
          <Route path="/driver/delivery/:id" element={<ActiveDeliveryRoute />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.EXECUTIVE]} />}>
        <Route element={<AppShell />}>
          <Route path="/executive" element={<ExecutiveAnalytics />} />
          <Route path="/executive/analytics" element={<ExecutiveAnalytics />} />
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
