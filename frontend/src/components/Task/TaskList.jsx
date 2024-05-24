import {
  Table,
  Space,
  Button,
  Input,
  Form,
  Tag,
  Row,
  Col,
  Select
} from 'antd';
import { Link } from 'react-router-dom';
import {
  DownloadOutlined,
  FormOutlined,
  SearchOutlined,
  PlusOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import useCommonDialog from '../../hooks/useCommonDialog';
import { projectService, employeeService, taskService } from '../../services/apiServices';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { utils } from 'xlsx/dist/xlsx.mini.min';
import { write } from 'xlsx';

export default function TaskList() {
  const [form] = Form.useForm();
  const [Dialog, openDialog] = useCommonDialog();
  const [taskList, setTaskList] = useState([]);
  const [filter, setFilter] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isGettingData, setIsGettingData] = useState(false);

  const statusOptions = [
    { value: "0", label: "In Progress" },
    { value: "1", label: "Done" },
    { value: "2", label: "Finished" },
    { value: "3", label: "Closed" },

  ];
  useEffect(() => {
    const fetchData = async () => {
      setIsGettingData(true);
      try {
        const result = await taskService.getAll();
        const project = await projectService.getAll();
        const employees = await employeeService.getAll();
        let tasks = result.data.map(task => {
          const statusLabel = statusOptions.find(option => option.value === task.status)?.value || "";
          return {
            ...task,
            key: task.task_id,
            projectName: project.data.data.filter((project) => project.project_id === task.project_id)[0].project_name,
            assigned_member: employees.data.filter((employee) => employee.employee_id === task.assigned_member_id)[0].employee_name,
            status: statusLabel,
            estimate_start_date: task.estimate_start_date ? dayjs(task.estimate_start_date).format('YYYY-MM-DD') : null,
            estimate_finish_date: task.estimate_finish_date ? dayjs(task.estimate_finish_date).format('YYYY-MM-DD') : null,
            actual_start_date: task.actual_start_date ? dayjs(task.actual_start_date).format('YYYY-MM-DD') : null,
            actual_finish_date: task.actual_finish_date ? dayjs(task.actual_finish_date).format('YYYY-MM-DD') : null,
          };
        });
        setTaskList(tasks);
        setFilter(tasks);
        setProjects(projects);
        setIsGettingData(false);
      }
      catch (err) {
        setIsGettingData(false);
        openDialog(err.message, "error");
      }
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Task ID',
      width: 200,
      dataIndex: 'task_id',
      sorter: {
        compare: (a, b) => a.task_id - b.task_id,
      }
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 200,
      sorter: {
        compare: (a, b) => a.title.localeCompare(b.title),
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      width: 200
    },
    {
      title: 'Assigned Employee',
      dataIndex: 'assigned_member',
      width: 200,
      sorter: {
        compare: (a, b) => a.assigned_member.localeCompare(b.assigned_member),
      }
    },
    {
      title: 'Estimate Hour',
      dataIndex: 'estimate_hr',
      width: 200,
      sorter: {
        compare: (a, b) => a.estimate_hr - b.estimate_hr,
      }
    },
    {
      title: 'Actual Hour',
      dataIndex: 'actual_hr',
      width: 200,
      sorter: {
        compare: (a, b) => a.actual_hr - b.actual_hr,
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      sorter: {
        compare: (a, b) => a.status.localeCompare(b.status),
      },
      render: (status) => {
        let color = '';
        let statusString = '';
        if (status === "0") {
          color = 'blue';
          statusString = 'Open';
        } else if (status === '1') {
          color = 'yellow';
          statusString = 'In Progress';
        } else if (status === '2') {
          color = 'green';
          statusString = 'Finished';
        } else if (status === '3') {
          color = 'red';
          statusString = 'Close'
        }
        return <Tag color={color} style={{ minWidth: 80, textAlign: 'center', padding: '3px' }}>{statusString}</Tag>;
      },

    },
    {
      title: 'Estimate Start Date',
      dataIndex: 'estimate_start_date',
      width: 200,
      render: (estimate_start_date) => <span>{estimate_start_date ? estimate_start_date : "N/A"}</span>,
      sorter: {
        compare: (a, b) => {
          if (a.estimate_start_date === null || a.estimate_start_date === undefined) {
            if (b.estimate_start_date === null || b.estimate_start_date === undefined) {
              return 0;
            } else {
              return -1;
            }
          } else if (b.estimate_start_date === null || b.estimate_start_date === undefined) {
            return 1;
          } else {
            return a.estimate_start_date.localeCompare(b.estimate_start_date);
          }
        },
        multiple: 1,
      },
    },
    {
      title: 'Estimate Finish Date',
      dataIndex: 'estimate_finish_date',
      width: 200,
      render: (estimate_finish_date) => <span>{estimate_finish_date ? estimate_finish_date : "N/A"}</span>,
      sorter: {
        compare: (a, b) => {
          if (a.estimate_finish_date === null || a.estimate_finish_date === undefined) {
            if (b.estimate_finish_date === null || b.estimate_finish_date === undefined) {
              return 0;
            } else {
              return -1;
            }
          } else if (b.estimate_finish_date === null || b.estimate_finish_date === undefined) {
            return 1;
          } else {
            return a.estimate_finish_date.localeCompare(b.estimate_finish_date);
          }
        },
        multiple: 1,
      },
    },
    {
      title: 'Actual Start Date',
      dataIndex: 'actual_start_date',
      width: 200,
      render: (actual_start_date) => <span>{actual_start_date ? actual_start_date : "N/A"}</span>,
      sorter: {
        compare: (a, b) => {
          if (a.actual_start_date === null || a.actual_start_date === undefined) {
            if (b.actual_start_date === null || b.actual_start_date === undefined) {
              return 0;
            } else {
              return -1;
            }
          } else if (b.actual_start_date === null || b.actual_start_date === undefined) {
            return 1;
          } else {
            return a.actual_start_date.localeCompare(b.actual_start_date);
          }
        },
        multiple: 1,
      },
    },
    {
      title: 'Actual Finish Date',
      dataIndex: 'actual_finish_date',
      width: 200,
      render: (actual_finish_date) => <span>{actual_finish_date ? actual_finish_date : "N/A"}</span>,
      sorter: {
        compare: (a, b) => {
          if (a.actual_finish_date === null || a.actual_finish_date === undefined) {
            if (b.actual_finish_date === null || b.actual_finish_date === undefined) {
              return 0;
            } else {
              return -1;
            }
          } else if (b.actual_finish_date === null || b.actual_finish_date === undefined) {
            return 1;
          } else {
            return a.actual_finish_date.localeCompare(b.actual_finish_date);
          }
        },
        multiple: 1,
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/task/edit/${record.task_id}`}>
            <Button type='primary'>
              <FormOutlined />
              Edit
            </Button>
          </Link>
        </Space>
      ),
    }
  ];

  const onSearch = async (values) => {
    const filteredData = taskList.filter(task => {
      if (values.title && !task.title.toLowerCase().includes(values.title.toLowerCase())) {
        return false;
      } else if (values.projectName && !task.projectName.toLowerCase().includes(values.projectName.toLowerCase())) {
        return false;
      } else if (values.assigned_member && !task.assigned_member.toLowerCase().includes(values.assigned_member.toLowerCase())) {
        return false;
      }
      return true
    })
    filteredData.length > 0 ? setFilter(filteredData) : setFilter(null);
  };

  const onClear = async () => {
    setFilter(taskList);
    form.resetFields();
  }

  const handleMenuClick = (e) => {
    const selectedStatus = e;
    if (selectedStatus === '4') {
      setFilter(taskList);
      return;
    }
    if (taskList.length > 0) {
      const filteredTasks = taskList.filter(task => task.status === selectedStatus);
      if (!filteredTasks) {
        setFilter(null);
      } else {
        setFilter(filteredTasks)
      }
    }
  }


  const ExcelDownload = (props) => {
    const { fileName, sheetName } = props;
    const downloadFile = () => {
      const dataWithCorrectHeaders = filter.map(item => ({
        "Task ID": item.task_id,
        "Title": item.title,
        "Description": item.description,
        "Project Name": item.projectName,
        "Assigned Employee": item.assigned_member,
        "Estimate Hour": item.estimate_hr,
        "Actual Hour": item.actual_hr,
        "Status": statusOptions.find(status => status.value === item.status).label,
        "Estimate Start Date": item.estimate_start_date,
        "Estimate Finish Date": item.estimate_finish_date,
        "Actual Start Date": item.actual_start_date,
        "Actual Finish Date": item.actual_finish_date
      }));

      const ws = utils.json_to_sheet(dataWithCorrectHeaders, {
        header: [
          "Task ID",
          "Title",
          "Description",
          "Project Name",
          "Assigned Employee",
          "Estimate Hour",
          "Actual Hour",
          "Status",
          "Estimate Start Date",
          "Estimate Finish Date",
          "Actual Start Date",
          "Actual Finish Date"
        ]
      });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, sheetName);
      const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
      saveAs(new Blob([buf], { type: 'application/octet-stream' }), fileName + '.xlsx');
    }
    return (
      <span onClick={downloadFile}>
        {props.children}
      </span>
    );
  };

  ExcelDownload.propTypes = {
    data: PropTypes.array,
    fileName: PropTypes.string,
    sheetName: PropTypes.string,
    children: PropTypes.object
  }

  const menuItems = [
    { key: '0', text: 'Open' },
    { key: '1', text: 'In Progress' },
    { key: '2', text: 'Finished' },
    { key: '3', text: 'Close' },
    { key: '4', text: 'All' },
  ]
  let newMenuItems = menuItems.map(item => ({
    value: item.key,
    label: item.text,
  }));

  return (
    <div>
      <Form
        onFinish={(values) => onSearch(values)}
        form={form}
      >
        <Space wrap style={{ display: 'flex', marginBottom: 10 }}>
          <Form.Item
            label="Status"
          >
            <Select
              defaultValue="All"
              onChange={handleMenuClick}
              style={{
                width: 170,
              }}
              options={newMenuItems}
            />
          </Form.Item>
        </Space>
        <Row align='top' gutter={16}>
          <Col xl={14} lg={24} md={24} sm={24} xs={24}>
            <Row gutter={16}>
              <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                <Form.Item name='title' style={{ minWidth: '100%' }}>
                  <Input placeholder='Title' />
                </Form.Item>
              </Col>
              <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                <Form.Item name='projectName' style={{ minWidth: '100%' }}>
                  <Input placeholder='Project Name' />
                </Form.Item>
              </Col>
              <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                <Form.Item name='assigned_member' style={{ minWidth: '100%' }}>
                  <Input placeholder='Assigned member' />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col xl={10} lg={24} md={24} sm={24} xs={24}>
            <Space align='center' wrap style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <Space size='middle'>
                <Button htmlType='submit' type='primary' icon={<SearchOutlined />} >
                  Search
                </Button>
                <Button
                  type='primary'
                  danger
                  icon={<CloseOutlined />}
                  onClick={onClear}
                >
                  Clear
                </Button>
              </Space>
              <Space size='middle'>
                <ExcelDownload fileName="Task List" sheetName="Sheet1">
                  <Button
                    type='primary'
                    icon={<DownloadOutlined />}
                    style={{ backgroundColor: "#00C292", color: "#fff" }}
                  >
                    Download
                  </Button>
                </ExcelDownload>
                <Link to='/task/add'>
                  <Button type='primary' ghost icon={<PlusOutlined />}>
                    New Task
                  </Button>
                </Link>
              </Space>
            </Space>
          </Col>
        </Row>
      </Form >
      <Table columns={columns}
        dataSource={filter}
        scroll={{ x: 1300, y: 400 }}
        loading={isGettingData}
        pagination={{ pageSize: 5 }} />
      <Dialog />
    </div >
  );
}