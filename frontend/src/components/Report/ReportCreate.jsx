import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from 'antd';
import "./ReportCreate.css";
import { reportService, projectService, employeeService, taskService } from '../../services/apiServices';
import dayjs from 'dayjs';
import { DeleteOutlined, EyeOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import useCommonDialog from '../../hooks/useCommonDialog';
import {
  ADMIN_REQUIRED,
  HOUR_REQUIRED,
  PERCENTAGE_REQUIRED,
  REPORT_CREATE_FAILED,
  REPORT_CREATE_SUCCESS,
  STATUS_REQUIRED,
  TASK_ID_REQUIRED,
  TYPE_REQUIRED,
  PERCENTAGE_MAX,
  PERCENTAGE_MIN,
  HOUR_MIN,
  TOTAL_HOUR
} from '../../constants/message';
import TextArea from 'antd/es/input/TextArea';

function ReportCreate() {
  const [form] = Form.useForm();
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);
  const [EmployeeOptions, setEmployeeOptions] = useState([]);
  const [TaskOptions, setTaskOptions] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const [dataSource, setDataSource] = useState([]);
  const [feeling, setFeeling] = useState("");
  const [loading, setLoading] = useState(false);
  const [Dialog, openDialog] = useCommonDialog('/report/list');
  const [requiredError, setRequiredError] = useState([]);

  function getError(record, name) {
    const error = requiredError.find((item) => {
      return item.key === record.key && item.field === name;
    });
    return error ? error.message : null;
  }

  function removeError(record, name) {
    const error = requiredError.find((item) => {
      return item.key === record.key && item.field === name;
    });
    if (error) {
      const index = requiredError.indexOf(error);
      if (index > -1) {
        requiredError.splice(index, 1);
      }
    }
  }

  let typesOption = [
    "CD",
    "Test",
    "Review",
    "Bugfix",
    "Learn",
    "Meeting"
  ];
  let newTypesOption = [];
  for (let i = 0; i < typesOption.length; i++) {
    newTypesOption.push({
      value: typesOption[i],
      label: typesOption[i],
    });
  }
  typesOption = newTypesOption;

  let statusOption = [
    'Open',
    'In Progress',
    'Finished',
    'Close',
  ];
  let newStatusOption = [];
  for (let i = 0; i < statusOption.length; i++) {
    newStatusOption.push({
      value: statusOption[i],
      label: statusOption[i],
    });
  }
  statusOption = newStatusOption;

  const updateDataSource = (value, record) => {
    const newDataSource = [...dataSource];
    const rowToUpdate = newDataSource.find(row => row.key === record.key);
    if (rowToUpdate) {
      rowToUpdate.selectedTaskId = value;
      rowToUpdate.task_id = value;
      const selectedTask = taskData.find(task => task.task_id === value);
      if (selectedTask) {
        rowToUpdate.selectedTask = selectedTask;
      }
      const project = projectData.find(project => project.project_id === selectedTask.project_id);
      if (project) {
        rowToUpdate.project = project.project_name;
      }
      setDataSource(newDataSource);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: "report_id",
      width: '3%',
    },
    {
      title: <span>
        Task ID
        <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
      </span>,
      dataIndex: 'task_id',
      render: (_, record) => {
        return (
          <Form
            initialValues={{
              task_id: "Select Task ID",
            }}
          >
            <Form.Item
              name="task_id"
              validateStatus={getError(record, 'task_id') ? 'error' : 'success'}
              help={getError(record, 'task_id')}
            >
              <Select
                style={{
                  width: 126,
                }}
                options={TaskOptions}
                onChange={(value) => {
                  updateDataSource(value, record);
                  removeError(record, 'task_id');
                }}
              />
            </Form.Item>
          </Form>
        );
      }
    },
    {
      title: 'Task Title',
      dataIndex: 'task_title',
      render: (_, record) => {
        return (
          <Form>
            <Form.Item>
              <Input
                disabled
                value={record.selectedTask ? record.selectedTask.title : ''}
              />
            </Form.Item>
          </Form>
        )
      }
    },
    {
      title: 'Project',
      dataIndex: 'project',
      render: (_, record) => {
        return (
          <Form>
            <Form.Item>
              <Input
                disabled
                value={record.project}
              />
            </Form.Item>
          </Form>
        )
      }
    },
    {
      title: <span>
        Percentage
        <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
      </span>,
      dataIndex: 'percentage',
      render: (text, record) => {
        return (
          <Form>
            <Form.Item
              name="percentage"
              validateStatus={getError(record, 'percentage') ? 'error' : 'success'}
              help={getError(record, 'percentage')}
            >
              <InputNumber
                value={text}
                addonAfter="%"
                onChange={event => {
                  handleInputChange(event, 'percentage', record.key);
                  removeError(record, 'percentage');
                }}
              />
            </Form.Item>
          </Form>
        )
      }
    },
    {
      title: <span>
        Types
        <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
      </span>,
      dataIndex: 'type',
      render: (text, record) => {
        return (
          <Form
            initialValues={{
              type: "Types",
            }}
          >
            <Form.Item
              name="type"
              validateStatus={getError(record, 'type') ? 'error' : 'success'}
              help={getError(record, 'type')}
            >
              <Select
                value={text}
                onSelect={(value) => {
                  handleSelectChange(value, 'type', record.key);
                  removeError(record, 'type');
                }}
                style={{
                  width: 140,
                }}
                options={typesOption}
              />
            </Form.Item>
          </Form>
        );
      }
    },
    {
      title: <span>
        Status
        <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
      </span>,
      dataIndex: 'status',
      render: (text, record) => {
        return (
          <Form
            initialValues={{
              status: "Status"
            }}
          >
            <Form.Item
              name="status"
              validateStatus={getError(record, 'status') ? 'error' : 'success'}
              help={getError(record, 'status')}
            >
              <Select
                value={text}
                onSelect={(value) => {
                  handleSelectChange(value, 'status', record.key);
                  removeError(record, 'status');
                }}
                style={{
                  width: 140,
                }}
                options={statusOption}
              />
            </Form.Item>
          </Form>
        );
      }
    },
    {
      title: <span>
        Hour
        <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
      </span>,
      dataIndex: 'hour',
      render: (text, record) => {
        return (
          <Form>
            <Form.Item
              name="hour"
              validateStatus={getError(record, 'hour') ? 'error' : 'success'}
              help={getError(record, 'hour')}
            >
              <InputNumber
                value={text}
                addonAfter="hr"
                onChange={value => {
                  handleInputChange(value, 'hour', record.key);
                  removeError(record, 'hour');
                }}
              />
            </Form.Item>
          </Form>
        )
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => {
        return (
          <>
            <Space>
              <Button type="text" danger onClick={() => handleRemove(record.key)} icon={<DeleteOutlined />}>
                <b>Remove</b>
              </Button>
            </Space>
          </>
        );
      },
    }
  ];

  useEffect(() => {
    employeeService.getAll().then((res) => {
      setEmployeeData(res.data);
    }).catch((err) => {
      openDialog(err.response && err.response.data.error || err.message, 'error');
    });

    projectService.getAll().then((res) => {
      setProjectData(res.data.data);
    }).catch((err) => {
      openDialog(err.response && err.response.data.error || err.message, 'error');
    });

    taskService.getAll().then((res) => {
      setTaskData(res.data);
    }).catch((err) => {
      openDialog(err.response && err.response.data.error || err.message, 'error');
    });
  }, []);

  useEffect(() => {
    let options = [];
    const admins = employeeData.filter(employee => employee.position === '0');
    for (let i = 0; i < admins.length; i++) {
      options.push({
        value: admins[i].employee_id,
        label: admins[i].employee_name,
      });
    }
    setEmployeeOptions(options);
  }, [employeeData]);

  useEffect(() => {
    let options = [];
    for (let i = 0; i < taskData.length; i++) {
      options.push({
        value: taskData[i].task_id,
      });
    }
    setTaskOptions(options);
  }, [taskData]);

  const selectedAdminObject = employeeData.find((employee) => employee.employee_id === selectedAdmin);

  const handleInputChange = (value, field, key) => {
    const sanitizedValue = String(value);
    const newData = [...dataSource];
    const target = newData.find(item => item.key === key);
    if (target) {
      target[field] = sanitizedValue;
      setDataSource(newData);
    }
  };

  const handleSelectChange = (value, field, key) => {
    const newData = [...dataSource];
    const target = newData.find(item => item.key === key);
    if (target) {
      target[field] = value;
      setDataSource(newData);
    }
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      report_id: `${count}`,
      task_title: ``,
      project: ``,
      percentage: "",
      type: "",
      status: "",
      hour: "",
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleRemove = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleReport = (values) => {
    let totalHour = 0;
    values.dataSource.map((hourData) => {
      const hour = Number(hourData.hour);
      totalHour += hour;
    })
    const error = [];
    const reportData = values.dataSource.map((report) => {
      if (!report.task_id) {
        error.push({ key: report.key, field: 'task_id', message: TASK_ID_REQUIRED });
      }
      if (!report.percentage || report.percentage === "") {
        error.push({ key: report.key, field: 'percentage', message: PERCENTAGE_REQUIRED });
      }
      if (report.percentage < 0) {
        error.push({ key: report.key, field: 'percentage', message: PERCENTAGE_MIN });
      }
      if (report.percentage > 100) {
        error.push({ key: report.key, field: 'percentage', message: PERCENTAGE_MAX });
      }
      if (!report.type || report.type === "") {
        error.push({ key: report.key, field: 'type', message: TYPE_REQUIRED });
      }
      if (!report.status || report.status === "") {
        error.push({ key: report.key, field: 'status', message: STATUS_REQUIRED });
      }
      if (!report.hour || report.hour === "") {
        error.push({ key: report.key, field: 'hour', message: HOUR_REQUIRED });
      }
      if (report.hour < 0) {
        error.push({ key: report.key, field: 'hour', message: HOUR_MIN });
      }
      return {
        reportId: report.report_id,
        taskId: report.task_id,
        taskTitle: report.selectedTask && report.selectedTask.title,
        project: report.project,
        percentage: report.percentage,
        type: report.type,
        status: report.status,
        hour: report.hour,
        date: report.selectedTask && dayjs(report.selectedTask.created_at).format('YYYY-MM-DD'),
      }
    });
    if (totalHour >= 8) {
      openDialog(TOTAL_HOUR, "error");
      return;
    }
    if (reportData.length === 0) {
      openDialog(REPORT_CREATE_FAILED, "error");
      return;
    }
    const reportTo = employeeData.find((employee) => {
      return employee.employee_id === selectedAdmin
    });
    if (!reportTo) {
      error.push({ key: 'reportTo', field: 'reportTo' });
    }
    if (error.length > 0) {
      setRequiredError(error);
      return;
    }
    const reportedBy = employeeData.find((employee) => {
      return employee.employee_id === values.loggedInUser.id
    })
    const payload = reportData.map((report) => {
      return {
        key: report.reportId,
        task_id: report.taskId,
        task_title: report.taskTitle,
        project: report.project,
        percentage: report.percentage,
        type: report.type,
        status: report.status,
        hour: report.hour,
        problem_feeling: values.feeling,
        report_to: reportTo.employee_id,
        reported_by: reportedBy.employee_id,
        created_at: report.date
      }
    });
    setLoading(true);
    reportService
      .add(payload)
      .then(() => {
        openDialog(REPORT_CREATE_SUCCESS, "Success");
        setLoading(false);
      })
      .catch(() => {
        openDialog(REPORT_CREATE_FAILED, "error");
        setLoading(false);
      })
  }

  return (
    <>
      <Form
        wrapperCol={{ span: 17 }}
        layout="horizontal"
        style={{ padding: '20px' }}
        labelAlign='left'
        form={form}
        initialValues={{
          admin: "Select Admin"
        }}
      >
        <Row justify={"space-between"}>
          <Col xl={10} lg={18} md={18} sm={18} xs={24} >
            <Form.Item
              required
              label={
                <span>
                  Report To
                  <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
                </span>
              }
              name="admin"
              validateStatus={requiredError.find((error) => error.field === 'reportTo') ? 'error' : ''}
              help={requiredError.find((error) => error.field === 'reportTo') ? ADMIN_REQUIRED : ''}
              style={{ marginBottom: '15px', width: '100%' }}
            >
              <Select
                options={EmployeeOptions}
                onChange={value => {
                  if (value) {
                    setSelectedAdmin(value);
                    removeError('reportTo');
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xl={2} lg={4} md={4} sm={4} xs={24} >
            <Button
              type="primary"
              onClick={handleAdd}
              icon={<PlusOutlined />}
              block
            >
              Add
            </Button>
          </Col>
        </Row >
      </Form >

      <Table
        style={{
          minHeight: '250px',
        }}
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 5 }}
      />
      <Form layout='vertical'>
        <Col span={24}>
          <Form.Item label="Problem" name="Feeling">
            <TextArea rows={4} placeholder="Problem" style={{ width: "30%" }} onChange={e => setFeeling(e.target.value)} />
          </Form.Item >
        </Col>
        <Row
          gutter={16}
          align='bottom'
          style={{
            marginTop: '15px'
          }}>
          <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
            <Space size='middle'>
              <Button
                style={{ backgroundColor: "#00C292", color: "#fff" }}
                type="primary"
                onClick={() => setOpen(true)}
                icon={<EyeOutlined />}
              >
                Preview
              </Button>
              <Modal
                title="Report Preview"
                centered
                open={open}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                width={400}
                footer={[
                  <Button key="back" onClick={() => setOpen(false)}>
                    Close
                  </Button>,
                ]}
              >
                <br />
                <p>Report To: <strong>{selectedAdminObject ? selectedAdminObject.employee_name : 'No admin selected'}</strong></p>
                <p>Date: <strong>{`${dayjs(new Date()).format('YYYY-MM-DD')}`}</strong></p>
                {employeeData.filter((empId) => empId.employee_id === loggedInUser.id).map((employee, index) => (
                  <p key={index}>Name: <strong>{employee.employee_name} </strong></p>
                ))}
                <p>Projects:
                  {dataSource.map((data, index) => (
                    <span key={index}> <strong>{data.project}, </strong></span>

                  ))}
                </p>
                <p>【実績】</p>
                {dataSource.map((item, index) =>
                (
                  <p key={index}>-
                    <strong>
                      {`${item.selectedTask?.title}`},
                      {`<${item.percentage}%>`},
                      {`<${item.type}>`},
                      {`<${item.status}>`},
                      {`<${item.hour}hr>`}
                    </strong>
                  </p>
                )

                )}
                <p>【実績】</p>
                <p>- {feeling}</p>
              </Modal>
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                loading={loading}
                onClick={() => handleReport(
                  {
                    dataSource,
                    selectedAdmin,
                    feeling,
                    loggedInUser
                  }
                )}
              >
                Report
              </Button>
            </Space>
          </Col>
        </Row >
        <Dialog />
      </Form >
    </>
  )
}
export default ReportCreate;