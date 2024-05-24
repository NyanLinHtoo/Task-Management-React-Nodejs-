import { Row, Col, Card, Table, Button, Space, Typography } from 'antd';
import { IdcardOutlined, ProjectOutlined, OrderedListOutlined, SendOutlined } from '@ant-design/icons';
import { Link, NavLink } from 'react-router-dom';
import './dashboard.css';
import { useCallback, useEffect, useState } from 'react';
import { employeeService, reportService, projectService, taskService } from '../../services/apiServices';
import useCommonDialog from '../../hooks/useCommonDialog';
import dayjs from 'dayjs';
import useAuth from '../../hooks/useAuth';
const { Title } = Typography;

const status = [
  { label: 'Open', value: '0' },
  { label: 'In Progress', value: '1' },
  { label: 'Finished', value: '2' },
  { label: 'Close', value: '3' }
];

const columns = [
  {
    key: 'id',
    title: 'Id',
    dataIndex: 'task_id',
    width: '3%',
    sorter: (a, b) => a.task_id - b.task_id
  },
  {
    key: 'title',
    title: 'Title',
    dataIndex: 'title'
  },
  {
    key: 'description',
    title: 'Description',
    dataIndex: 'description'
  },
  {
    key: 'project_name',
    title: 'Project Name',
    dataIndex: 'projectName'
  },
  {
    key: 'assigned_employee',
    title: 'Assigned Employee',
    dataIndex: 'assignedEmployee'
  },
  {
    key: 'estimate_hours',
    title: 'Estimated Hours',
    dataIndex: 'estimatedHours',
    render: (text) => text ? text : 'N/A'
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (text) => {
      let color;
      let backgroundColor;
      switch (text && text.toLowerCase()) {
        case 'open':
          color = '#0958d9';
          backgroundColor = '#0000ff2e';
          break;
        case 'in progress':
          color = '#faad14';
          backgroundColor = '#f2f21026';
          break;
        case 'finished':
          color = '#52c41a';
          backgroundColor = '#09e0094d';
          break;
        case 'close':
          color = '#ff4d4f';
          backgroundColor = '#f2313438';
          break;
        default:
          color = '#52c41a';
          backgroundColor = '#09e0094d';
          break;
      }
      return <div
        style={{
          color: color,
          whiteSpace: 'nowrap',
          minWidth: '80px',
          backgroundColor: backgroundColor,
          borderRadius: '5px',
          padding: '5px',
          textAlign: 'center'
        }}>{text}</div>
    }
  },
  {
    key: 'estimate_start_date',
    title: 'Estimate Start Date',
    dataIndex: 'estimate_start_date',
    render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : 'N/A'
  },
  {
    key: 'estimate_finish_date',
    title: 'Estimate Finish Date',
    dataIndex: 'estimate_finish_date',
    render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : 'N/A'
  },
  {
    key: 'actual_start_date',
    title: 'Actual Start Date',
    dataIndex: 'actual_start_date',
    render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : 'N/A'
  },
  {
    key: 'actual_finish_date',
    title: 'Actual Finish Date',
    dataIndex: 'actual_finish_date',
    render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : 'N/A'
  },
  {
    key: 'action',
    title: 'Action',
    dataIndex: 'action',
    render: (_, record) => (
      <Space size="middle">
        <NavLink to={`/task/edit/${record.task_id}`}>
          <Button style={{ backgroundColor: '#00C292', color: '#fff' }}>Update</Button>
        </NavLink>
      </Space>
    )
  }
];

function Dashboard() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notCloseTasks, setNotCloseTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [Dialog, openDialog] = useCommonDialog();
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateData = useCallback(() => {
    let result = notCloseTasks.map((task) => {
      task.key = task.task_id;
      task.projectName = projects.find((project) => project.project_id === task.project_id)?.project_name;
      task.assignedEmployee = employees.find((employee) => employee.employee_id === task.assigned_member_id)?.employee_name;
      task.status = status.find((item) => item.value === task.status)?.label;
      return task;
    });
    setUpdatedTasks(result);
  }, [notCloseTasks, projects, employees]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeService.getAll(),
      projectService.getAll(),
      taskService.getAll(),
      reportService.getAll()
    ])
      .then(([employeesRes, projectsRes, tasksRes, reportsRes]) => {
        setEmployees(employeesRes.data);
        setProjects(projectsRes.data.data);
        setTasks(tasksRes.data);
        setReports(reportsRes.data.data);

        let result = tasksRes.data;
        result = result.filter((task) => task.status !== '3');
        setNotCloseTasks(result);
        setLoading(false);
      })
      .catch((err) => {
        openDialog(err.response && err.response.data || err.message, 'error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    updateData();
  }, [updateData]);

  return (
    <>
      <Row gutter={[16, 16]} justify='center'>
        <Col span={24}>
          <Row gutter={[16, 16]} align='middle' justify='center'>
            {isAdmin &&
              <>
                <Col xl={6} lg={6} md={6} sm={12} xs={24}>
                  <Link to='/employee/list'>
                    <Card className='first-card' style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                      <Row align='middle' justify='start'>
                        <Col span={8}>
                          <IdcardOutlined style={{ fontSize: 40, color: 'rgba(0,0,0,0.7)' }} />
                        </Col>
                        <Col span={16}>
                          <p className='name'>Employee</p>
                          <p className='count'>{employees && employees.length || 0}</p>
                        </Col>
                      </Row>
                    </Card>
                  </Link>
                </Col>
                <Col xl={6} lg={6} md={6} sm={12} xs={24}>
                  <Card className='second-card' style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                    <Link to='/project/list'>
                      <Row align='middle' justify='start'>
                        <Col span={8}>
                          <ProjectOutlined style={{ fontSize: 40, color: 'rgba(0,0,0,0.7)' }} />
                        </Col>
                        <Col span={16}>
                          <p className='name'>Projects</p>
                          <p className='count'>{projects && projects.length || 0}</p>
                        </Col>
                      </Row>
                    </Link>
                  </Card>
                </Col>
              </>
            }
            <Col xl={6} lg={6} md={6} sm={12} xs={24}>
              <Link to='/task/list'>
                <Card className='third-card' style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                  <Row align='middle' justify='start'>
                    <Col span={8}>
                      <OrderedListOutlined style={{ fontSize: 40, color: 'rgba(0,0,0,0.7)' }} />
                    </Col>
                    <Col span={16}>
                      <p className='name'>Tasks</p>
                      <p className='count'>{tasks && tasks.length}</p>
                    </Col>
                  </Row>
                </Card>
              </Link>
            </Col>
            <Col xl={6} lg={6} md={6} sm={12} xs={24}>
              <Link to='/report/list'>
                <Card className='fourth-card' style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                  <Row align='middle' justify='start'>
                    <Col span={8}>
                      <SendOutlined style={{ fontSize: 40, color: 'rgba(0,0,0,0.7)' }} />
                    </Col>
                    <Col span={16}>
                      <p className='name'>Report</p>
                      <p className='count'>{reports && reports.length || 0}</p>
                    </Col>
                  </Row>
                </Card>
              </Link>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Title level={3} align='center'>Top Not Closed Tasks</Title>
        </Col>
        <Col span={24}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={updatedTasks}
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 5 }}
          />
        </Col>
        <Col span={24} align='center'>
          <NavLink to='/task/list'>
            <Button type='primary' style={{ backgroundColor: '#00C292', color: '#fff' }}>
              View All Tasks
            </Button>
          </NavLink>
        </Col>
      </Row>
      <Dialog />
    </>
  );
}

export default Dashboard;