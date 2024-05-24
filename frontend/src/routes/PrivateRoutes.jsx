import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoutes() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}
export default PrivateRoutes;
