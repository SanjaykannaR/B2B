import { useNavigate } from 'react-router-dom';
import NotificationsPanel from '../../components/driver/NotificationsPanel';

export default function DriverNotifications() {
  const navigate = useNavigate();
  return <NotificationsPanel variant="page" onClose={() => navigate('/driver')} />;
}