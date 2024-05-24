import { Menu } from 'antd';
import PropTypes from 'prop-types';
import './leftNav.css';

function LeftNav({ onSelectedMenu, selectedKeys, menus }) {
  return (
    <Menu className='leftNav' mode="horizontal" onClick={onSelectedMenu} defaultSelectedKeys={[0]} selectedKeys={selectedKeys} items={menus} />
  )
}

LeftNav.propTypes = {
  onSelectedMenu: PropTypes.func.isRequired,
  selectedKeys: PropTypes.array.isRequired,
  menus: PropTypes.array.isRequired
}

export default LeftNav;