import {
  Button,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Divider,
  Select,
  Spin
} from 'antd';
import {
  SaveOutlined,
  RollbackOutlined,
  EditOutlined
} from "@ant-design/icons"
import { Link, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  ESTIMATE_HOUR,
  TASK_DATE_VALIDATE,
  TASK_CREATE_SUCCESSFUL,
  TASK_UPDATE_SUCCESSFUL,
  TASK_UPDATE_FAILED,
  TASK_CREATE_FAILED,
  PROJECT,
  TASK_TITLE,
  TASK_DESCRIPTION,
  ASSIGNED_EMPLOYEE,
} from '../../constants/message';
import useCommonDialog from '../../hooks/useCommonDialog';
import './CommonTask.css'
import { taskService, projectService, employeeService } from '../../services/apiServices';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';
// import { ENDPOINT } from '../../../env';

const ENDPOINT = import.meta.env.VITE_ENDPOINT;

function CommonTask() {
  const { id } = useParams();
  const location = useLocation();
  const [form] = Form.useForm();
  const [selectedTask, setSelectedTask] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isGettingData, setIsGettingData] = useState(false)
  const [taskName, setTaskName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [Dialog, openDialog] = useCommonDialog('/task/list');
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const { Option } = Select;
  const statusOptions = [
    { value: '0', label: "Opened" },
    { value: '1', label: "In Progress" },
    { value: '2', label: "Finished" },
    { value: '3', label: "Closed" }
  ]
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  }

  const validateDates = (endFieldName) => ({ getFieldValue }) => ({
    validator(_, value) {
      return new Promise((resolve, reject) => {
        const endDate = getFieldValue(endFieldName);
        if (value && endDate) {
          const startDateTime = new Date(value.format());
          const endDateTime = new Date(endDate.format());
          if (startDateTime > endDateTime) {
            return reject(new Error(TASK_DATE_VALIDATE));
          }
        }
        resolve();
      })
    }
  });

  const fetchData = async () => {
    setIsGettingData(true);
    try {
      const project = await projectService.getAll();
      const employees = await employeeService.getAll();
      setSelectedTask(project.data.data.map(task => ({
        value: task.project_id,
        label: `${project.data.data.find(p => p.project_id === task.project_id)?.project_name}`,
      })));
      setSelectedEmployee(employees.data.map(employee => ({
        value: employee.employee_id,
        label: employee.employee_name,
      })));
    } catch (err) {
      setIsGettingData(false);
      openDialog(err.message, "error");
    }
  }

  const addData = useCallback((id) => {
    taskService.getOne(id)
      .then(res => {
        const statusLabel = statusOptions.find(option => option.value === res.data.status)?.label;
        form.setFieldsValue({
          project_id: res.data.project_id,
          title: res.data.title,
          description: res.data.description,
          assigned_member_id: res.data.assigned_member_id,
          estimate_hr: res.data.estimate_hr,
          actual_hr: res.data.actual_hr,
          status: statusLabel,
          estimate_start_date: res.data.estimate_start_date ? dayjs(res.data.estimate_start_date, 'YYYY-MM-DD') : null,
          estimate_finish_date: res.data.estimate_finish_date ? dayjs(res.data.estimate_finish_date, 'YYYY-MM-DD') : null,
          actual_start_date: res.data.actual_start_date ? dayjs(res.data.actual_start_date, 'YYYY-MM-DD') : null,
          actual_finish_date: res.data.actual_finish_date ? dayjs(res.data.actual_finish_date, 'YYYY-MM-DD') : null,
        });
        setIsGettingData(false);
      })
      .catch((err) => {
        setIsGettingData(false);
        openDialog(err.message, "error")
      });
  }, [])

  useEffect(() => {
    setIsGettingData(true);
    if (location.pathname.includes("/add")) {
      setTaskName("Add");
    } else {
      setTaskName("Edit")
      addData(id);
    }
    fetchData();
  }, [id, location.pathname, form]);

  const handleSubmit = (values) => {
    const socket = io.connect(ENDPOINT)
    const payload = {
      ...values,
      project_id: parseInt(values.project_id),
      status: statusOptions.filter(option => option.value === values.status || option.label === values.status)[0]?.value
    };
    if (!id) {
      setLoading(true);
      taskService
        .add(payload)
        .then((res) => {
          socket.emit('taskCreated', { ...res.data.data, user: loggedInUser });
          openDialog(TASK_CREATE_SUCCESSFUL, "Success");
          setLoading(false);
        })
        .catch(() => {
          openDialog(TASK_CREATE_FAILED, "error");
          setLoading(false);
        })
    } else {
      setLoading(true);
      taskService
        .update(id, payload)
        .then((res) => {
          socket.emit('taskUpdated', { ...res.data.data, user: loggedInUser });
          openDialog(TASK_UPDATE_SUCCESSFUL, "Success");
          setLoading(false);
        })
        .catch(() => {
          openDialog(TASK_UPDATE_FAILED, "error");
          setLoading(false);
        })
    }
  }

  return (
    <Spin spinning={isGettingData && taskName !== "Add"}>
      <div style={{
        maxWidth: 700,
        margin: 'auto',
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        boxShadow: '0px 0px 5px #ccc',
        paddingTop: '1px',
        borderRadius: 10
      }}>
        <Typography.Title
          level={3}
          style={{
            textAlign: 'center',
          }}>
          {taskName === "Add" && "New Task"}
          {taskName === "Edit" && "Update Task"}
        </Typography.Title >
        <Divider />
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 17 }}
          layout="horizontal"
          style={{ padding: '20px' }}
          onFinish={handleSubmit}
          labelAlign='left'
        >
          <Form.Item
            label={
              <span>
                Project
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="project_id"
            rules={[{ required: true, message: PROJECT }]}
          >
            <Select
              value={selectedProject}
              onChange={value => setSelectedProject(value)}
              placeholder="Select a project"
              showSearch
              optionFilterProp="label"
              filterOption={(inputValue, option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
              options={selectedTask}
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Title
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="title"
            rules={[{ required: true, message: TASK_TITLE }]}
          >
            <Input placeholder="Title here" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Description
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="description"
            rules={[{ required: true, message: TASK_DESCRIPTION }]}
          >
            <Input placeholder="Enter Description" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Employee
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="assigned_member_id"
            rules={[{ required: true, message: ASSIGNED_EMPLOYEE }]}
          >
            <Select
              value={employees}
              onChange={value => {
                setEmployees(value)
              }}
              placeholder="Select an employee"
              showSearch
              optionFilterProp="label"
              filterOption={(inputValue, option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
              options={selectedEmployee}
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Estimate Hour
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="estimate_hr"
            rules={[
              {
                required: true,
                message: ESTIMATE_HOUR
              },
              {
                pattern: /^[0-9]+$/,
                message: 'only the number of hours is allowed'
              }
            ]}
          >
            <Input placeholder='Estimate hour' />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Estimate Start
              </span>
            }
            justify="space-between"
            name="estimate_start_date"
            rules={[validateDates('estimate_finish_date')]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="yyyy-mm-dd"
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Estimate Finish
              </span>
            }
            justify="space-between"
            name="estimate_finish_date"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="yyyy-mm-dd"
            />
          </Form.Item>
          {taskName !== 'Add' &&
            <Form.Item
              label={
                <span>
                  Status
                  <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
                </span>
              }
              justify="space-between"
              name="status"
            >
              <Select value={selectedStatus} onChange={handleStatusChange}>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          }
          {taskName !== "Add" &&
            <Form.Item
              label={
                <span>
                  Actual Hour
                </span>
              }
              justify="space-between"
              name="actual_hr"
              rules={[
                {
                  pattern: /^[0-9]+$/,
                  message: 'only the number of hours is allowed'
                }
              ]}
            >
              <Input placeholder='Hours' />
            </Form.Item>
          }
          {taskName !== "Add" &&
            <Form.Item
              label={
                <span>
                  Actual Start
                </span>
              }
              justify="space-between"
              name="actual_start_date"
              rules={[validateDates('actual_finish_date')]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="yyyy-mm-dd"
              />
            </Form.Item>
          }
          {taskName !== "Add" &&
            <Form.Item
              label={
                <span>
                  Actual Finish
                </span>
              }
              justify="space-between"
              name="actual_finish_date"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="yyyy-mm-dd"
              />
            </Form.Item>
          }
          <Row justify='center' gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Link to="/task/list">
                <Button
                  type="primary"
                  danger
                  style={{ width: '100%' }}
                >
                  <RollbackOutlined />Cancel
                </Button>
              </Link>
            </Col>
            <Col xs={24} md={12}>
              <Button
                type="primary"
                htmlType='submit'
                loading={loading}
                style={{ width: '100%' }}
              >
                {id ? (<EditOutlined />) : (<SaveOutlined />)}
                {id ? 'Update' : 'Save'}
              </Button>
            </Col>
          </Row>
        </Form>
        <Dialog />
      </div >
    </Spin>
  );
}

export default CommonTask;