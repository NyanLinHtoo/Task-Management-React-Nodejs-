import {
  Table,
  Space,
  Button,
  Modal,
  Input,
  Form,
  Row,
  Col,
  Tag
} from 'antd';
import { Link } from 'react-router-dom';
import {
  ContactsOutlined,
  DeleteOutlined,
  CloseOutlined,
  FormOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { EMPLOYEE_DELETE_CONFIRMATION, EMPLOYEE_DELETE_SUCCESSFUL } from '../../constants/message';
import useCommonDialog from '../../hooks/useCommonDialog';
import dayjs from 'dayjs';
import { employeeService } from '../../services/apiServices';
import { io } from 'socket.io-client';
const { confirm } = Modal;
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ENDPOINT = import.meta.env.VITE_ENDPOINT;

function EmployeeList() {
  const [searchForm] = Form.useForm();
  const [filteredList, setFilteredList] = useState([]);
  const [Dialog, openDialog] = useCommonDialog();
  const [employeeList, setEmployeeList] = useState([]);
  const [isGettingData, setIsGettingData] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setIsGettingData(true);
    employeeService.getAll().then((res) => {
      const result = res.data.map((item) => {
        return (
          {
            ...item,
            key: item.employee_id,
            dob: item.dob ? dayjs(item.dob).format('YYYY-MM-DD') : null,
            position: item.position === '0' ? 'Admin' : 'Member'
          });
      });
      setIsGettingData(false);
      setEmployeeList(result);
    }).catch((err) => {
      setIsGettingData(false);
      openDialog(err.response && err.response.data || err.message, 'error');
    });
  }, []);

  useEffect(() => {
    setFilteredList(employeeList);
  }, [employeeList]);

  const showDeleteConfirm = useCallback(async (record) => {
    const socket = io.connect(ENDPOINT)
    const modal = confirm({
      title: EMPLOYEE_DELETE_CONFIRMATION,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: async () => {
        modal.update({ okButtonProps: { loading: true } });
        try {
          const result = await employeeService.delete(record.employee_id)
          if (result) {
            socket.emit('employeeDeleted', { ...record, user: loggedInUser });
            const newEmployeeList = employeeList.filter((item) => item.employee_id !== record.employee_id);
            setEmployeeList(newEmployeeList);
            modal.update({ okButtonProps: { loading: false } });
            openDialog(EMPLOYEE_DELETE_SUCCESSFUL, 'success');
          }
        } catch (err) {
          openDialog(err.response.data || err.message, 'error');
          modal.update({ okButtonProps: { loading: false } });
          modal.destroy();
        }
      }
    });
  }, [employeeList, openDialog]);

  const columns = [
    {
      title: "ID",
      dataIndex: "employee_id",
      width: '3%',
      sorter: {
        compare: (a, b) => a.employee_id - b.employee_id,
        multiple: 3,
      },
    },
    {
      title: "Employee Name",
      dataIndex: "employee_name",
      sorter: {
        compare: (a, b) => a.employee_name.localeCompare(b.employee_name),
        multiple: 2,
      },
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Profile Photo",
      dataIndex: "profile",
      render: (profile) => (
        <LazyLoadImage
          alt={profile}
          effect="blur"
          src={profile}
          width={64}
          height={64}
          style={{ borderRadius: '5px', objectFit: 'cover' }}
        />
      )
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (address) => <span>{address ? address : "N/A"}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (phone) => <span>{phone ? phone : "N/A"}</span>,
    },
    {
      title: "Position",
      dataIndex: "position",
      render: (position) => <span>{position}</span>,
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      render: (dob) => <span>{dob ? dob : "N/A"}</span>,
      sorter: {
        compare: (a, b) => {
          if (a.dob === null || a.dob === undefined) {
            if (b.dob === null || b.dob === undefined) {
              return 0;
            } else {
              return -1;
            }
          } else if (b.dob === null || b.dob === undefined) {
            return 1;
          } else {
            return a.dob.localeCompare(b.dob);
          }
        },
        multiple: 1,
      },
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      render: (verified) => {
        switch (verified) {
          case true:
            return <Tag color="green" style={{ minWidth: 80, textAlign: 'center', padding: 4 }}>Verified</Tag>;
          case false:
            return <Tag color="red" style={{ minWidth: 80, textAlign: 'center', padding: 4 }}>Not Verified</Tag>;
        }
      }
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Space size='middle'>
          <Link to={`/employee/detail/${record.employee_id}`}>
            <Button
              type='primary'
              style={{ backgroundColor: "#00C292", color: "#fff" }}
            >
              <ContactsOutlined style={{ marginRight: 5 }} />
              Detail
            </Button>
          </Link>
          <Link to={`/employee/edit/${record.employee_id}`}>
            <Button type='primary'>
              <FormOutlined style={{ marginRight: 5 }} />
              Edit
            </Button>
          </Link>
          <Button
            type='primary'
            danger
            onClick={() => showDeleteConfirm(record)}
          >
            <DeleteOutlined style={{ marginRight: 5 }} />
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const onSearch = (values) => {
    setFilteredList(employeeList);
    let newEmployeeList;
    if (values.id) {
      newEmployeeList = employeeList.filter((item) => item.employee_id === parseInt(values.id));
    }
    if (values.name) {
      newEmployeeList = employeeList.filter((item) =>
        item.employee_name.toLowerCase().includes(values.name.toLowerCase())
      );
    }
    if (values.id && values.name) {
      newEmployeeList = employeeList.filter(
        (item) =>
          item.employee_id === parseInt(values.id) &&
          item.employee_name.toLowerCase().includes(values.name.toLowerCase())
      );
    }
    if (!values.id && !values.name) {
      newEmployeeList = employeeList;
    }
    setFilteredList(newEmployeeList);
  };

  const onClear = () => {
    searchForm.resetFields();
    setFilteredList(employeeList);
  };
  return (
    <>
      <Form
        form={searchForm}
        layout='horizontal'
        style={{ marginBottom: 10 }}
        onFinish={onSearch}
      >
        <Row align='top' gutter={16}>
          <Col xl={10} lg={10} md={24} sm={24} xs={24}>
            <Row gutter={16}>
              <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                <Form.Item name='id' style={{ minWidth: '100%' }}>
                  <Input placeholder='Employee ID' />
                </Form.Item>
              </Col>
              <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                <Form.Item name='name' style={{ minWidth: '100%' }}>
                  <Input placeholder='Employee Name' />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col xl={14} lg={14} md={24} sm={24} xs={24}>
            <Space align='center' wrap style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <Space size='middle'>
                <Button htmlType='submit' type='primary' icon={<SearchOutlined />}>
                  Search
                </Button>
                <Button
                  type='primary'
                  onClick={onClear}
                  danger
                  icon={<CloseOutlined />}
                >
                  Clear
                </Button>
              </Space>
              <Link to='/employee/add'>
                <Button
                  type='primary'
                  icon={<UserAddOutlined />}
                  style={{ backgroundColor: '#00C292', color: '#fff' }}
                >
                  New Employee
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        loading={isGettingData}
        dataSource={filteredList}
        size='large'
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 5 }}
      />
      <Dialog />
    </>
  );
}

export default EmployeeList;
