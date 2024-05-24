import { Button, Space, Tooltip, Empty, Drawer, Menu, Row } from 'antd';
import { LogoutOutlined, CloseOutlined, MenuOutlined } from '@ant-design/icons';
import './rightNav.css';
import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Notification from '../Notification/Notification';
import PropTypes from 'prop-types';
import { employeeService } from '../../services/apiServices';
import useCommonDialog from '../../hooks/useCommonDialog';
import useAuth from '../../hooks/useAuth';
import { useSocketNotifications } from '../Notification/socketForNoti';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function RightNav({ adminMenuItems, onSelectedMenu, selectedKeys, isDesktop }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const { notifications, onRead } = useSocketNotifications();
  const [openDialog] = useCommonDialog();
  const { logout, userId } = useAuth();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (userId) {
      employeeService.getOne(userId).then((res) => {
        setUserDetail(res.data);
      }
      ).catch((err) => {
        openDialog(err.request.response || err.message, 'error');
      });
    }
  }, [userId, pathname]);

  let name = userDetail && userDetail.employee_name;
  const content = (
    <div className='popover-content'>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div key={notification.id}>
            <div className={notification.read ? 'notification-content read' : 'notification-content unread'} onClick={() => onRead(notification)}>
              <div className='notification-info'>
                <p className='description'>{notification.description}</p>
              </div>
            </div>
          </div>
        )
        )
      ) : (
        <Empty description='No Notifications' />
      )}
    </div>
  );
  return (
    <>
      <Space align='center' size='large' style={{ justifyContent: 'space-between' }}>
        {isDesktop && userDetail &&
          <Tooltip title={name}>
            <NavLink to={`/profile`}>
              <div className='user-name'>{name}</div>
            </NavLink>
          </Tooltip>
        }
        <Notification content={content} notifications={notifications} />
        {isDesktop &&
          <Button
            className='logout-btn'
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
            }}
          >Log Out</Button>}
        <Button className='menu-btn' onClick={() => setShowDrawer(true)} icon={<MenuOutlined />}></Button>
      </Space>
      <Drawer
        className='drawer'
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        closeIcon={<CloseOutlined className="custom-close-icon" />}
        placement='right'>
        <NavLink to='/profile'>
          <Row align='middle' className='user-name-drawer' style={{ gap: '20px', marginBottom: '20px' }}>
            <LazyLoadImage width={50} height={50} effect='blur' style={{ objectFit: 'cover', borderRadius: 10 }} src={userDetail && userDetail.profile} />
            <p >{name}</p>
          </Row>
        </NavLink>
        <Menu mode='inline' items={adminMenuItems} onClick={onSelectedMenu} selectedKeys={selectedKeys} />
        <Button
          style={{ marginTop: '20px', width: '100%' }}
          icon={<LogoutOutlined />}
          onClick={() => {
            logout();
            setShowDrawer(false);
          }}>
          Log Out
        </Button>
      </Drawer>
    </>
  )
}

RightNav.propTypes = {
  adminMenuItems: PropTypes.array,
  onSelectedMenu: PropTypes.func,
  selectedKeys: PropTypes.array,
  isDesktop: PropTypes.bool
};

export default RightNav;