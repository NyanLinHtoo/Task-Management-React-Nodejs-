import { Link, Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LeftNav from './LeftNav';
import RightNav from './RightNav';
import './layout.css';
import useAuth from '../../hooks/useAuth';
import { MenuItems } from '../../constants/LeftNavMenu';
import { FloatButton } from 'antd';

function NavLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const password = params.get('password');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [adminMenuItems, setAdminMenuItems] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDesktop, setIsDesktop] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSelectedKeys([pathname]);
    let items = isAdmin ? MenuItems : MenuItems.filter(item => item.permission !== 'admin');
    if (windowWidth >= 800) {
      items = items.filter(item => item.desktoponly === "true");
      setAdminMenuItems(items);
      setIsDesktop(true);
    } else {
      setIsDesktop(false);
    }
    setAdminMenuItems(items);
  }, [pathname, navigate, isAdmin, windowWidth]);

  const onSelectedMenu = (e) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(e.key);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isRedirectLink = !!(email && password);
    const fullPath = isRedirectLink ? pathname + location.search : pathname;
    let path = pathname.split('/');
    path[0] === '' ? path = path[1] : path = path[0];
    if (!token && !['change-password', 'forget-password', 'reset-password', 'verify'].includes(path)) {
      isRedirectLink ? navigate(fullPath) : navigate('/login');
    } if (token && (pathname === '/' || pathname === '/login')) {
      navigate('/dashboard');
    }
  }, [navigate, pathname]);

  return (
    <div className='layout-container'>
      <div className='nav'>
        <div className='left-nav'>
          <div className='logo'>
            <Link to='/dashboard'>
              <img src='../../task-management.svg' alt='logo' />
            </Link>
            <p>Task Management System</p>
          </div>
          {isAuthenticated &&
            <LeftNav
              className='left-menu'
              menus={adminMenuItems}
              onSelectedMenu={onSelectedMenu}
              selectedKeys={selectedKeys}
            />}
        </div>
        {isAuthenticated &&
          <RightNav
            className='right-menu'
            adminMenuItems={adminMenuItems}
            onSelectedMenu={onSelectedMenu}
            selectedKeys={selectedKeys}
            isDesktop={isDesktop} />}
      </div>
      <div style={{ padding: "30px", paddingTop: "100px" }}>
        <Outlet />
        <FloatButton.BackTop tooltip='Back To Top' type='primary' style={{ bottom: 80 }} />
      </div>
      <div className='footer'>
        <p>METATEAM MYANMAR</p>
        <p>Copyright &copy; 2023</p>
      </div>
    </div>
  )
}

export default NavLayout;