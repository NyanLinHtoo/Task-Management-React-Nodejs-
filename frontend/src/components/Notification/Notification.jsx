import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Popover } from 'antd';
import PropTypes from 'prop-types';

function Notification({ content, notifications }) {
  const calculateNotification = () => {
    return notifications.filter((item) => item.read === false).length;
  };
  return (
    <Badge className='notification' count={calculateNotification()}>
      <Popover
        placement='bottomRight'
        content={content}
        trigger='click'
      >
        <Button icon={<BellOutlined />} />
      </Popover>
    </Badge>
  );
}

Notification.propTypes = {
  content: PropTypes.element.isRequired,
  notifications: PropTypes.array.isRequired
}

export default Notification;