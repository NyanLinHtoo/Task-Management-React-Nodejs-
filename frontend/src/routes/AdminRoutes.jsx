import { Outlet } from 'react-router-dom';
import jwt from 'jwt-decode';
import RouteError from '../utils/RouteError';

function AdminRoutes() {
  const token = localStorage.getItem('token');
  const userDetail = jwt(token);
  if (userDetail.type !== '0') {
    throw new RouteError('You are not authorized to access this page', 403);
  }
  return <Outlet />;
}

export default AdminRoutes;