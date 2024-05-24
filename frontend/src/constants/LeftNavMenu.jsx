import {
  UserAddOutlined,
  TeamOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  UserOutlined,
  SolutionOutlined,
  ScheduleOutlined,
  PicLeftOutlined,
  MenuUnfoldOutlined,
  AreaChartOutlined
} from '@ant-design/icons';

export const MenuItems = [
  {
    label: 'Dashboard',
    icon: <AreaChartOutlined />,
    desktoponly: 'true',
    key: '/dashboard'
  },
  {
    label: 'Employee',
    permission: 'admin',
    icon: <UserOutlined />,
    desktoponly: 'true',
    children: [
      {
        label: 'New Employee',
        key: '/employee/add',
        icon: <UserAddOutlined />
      },
      {
        label: 'Employee List',
        key: '/employee/list',
        icon: <TeamOutlined />
      }
    ]
  },
  {
    label: 'Project',
    permission: 'admin',
    icon: <SolutionOutlined />,
    desktoponly: 'true',
    children: [
      {
        label: 'New Project',
        key: '/project/add',
        icon: <PlusCircleOutlined />
      },
      {
        label: 'Project List',
        key: '/project/list',
        icon: <UnorderedListOutlined />
      }
    ],
  },
  {
    label: 'Tasks',
    icon: <ScheduleOutlined />,
    desktoponly: 'true',
    children: [
      {
        label: 'New Task',
        key: '/task/add',
        icon: <PlusCircleOutlined />
      },
      {
        label: 'Task List',
        key: '/task/list',
        icon: <UnorderedListOutlined />
      }
    ]
  },
  {
    label: 'Reports',
    icon: <MenuUnfoldOutlined />,
    desktoponly: 'true',
    children: [
      {
        label: 'New Report',
        key: '/report/add',
        icon: <PlusCircleOutlined />
      },
      {
        label: 'Report List',
        key: '/report/list',
        icon: <PicLeftOutlined />
      }
    ]
  }
];