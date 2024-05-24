import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table
} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { DELETE_PROJECT, PROJECT_DELETE_SUCCESS } from '../../constants/message';
import useCommonDialog from '../../hooks/useCommonDialog';
import { projectService } from '../../services/apiServices';
import { useCallback } from 'react';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_ENDPOINT;

function ProjectList() {
  const [form] = Form.useForm();
  const [Dialog, openDialog] = useCommonDialog();
  const { confirm } = Modal;
  const [isGettingData, setIsGettingData] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      setIsGettingData(true)
      try {
        const result = await projectService.getAll();
        const projects = result.data.data.map(project => {
          return {
            ...project,
            key: project.project_id,
            start_date: dayjs(project.start_date).format('YYYY-MM-DD'),
            end_date: dayjs(project.end_date).format('YYYY-MM-DD')
          };
        });
        setAllData(projects);
        setFilteredData(projects);
        setIsGettingData(false);
      }
      catch (err) {
        setIsGettingData(false);
        openDialog(err.message, "error");
      }
    }
    fetchData();
  }, []);

  const showDeleteConfirm = useCallback(async (record) => {
    const socket = io.connect(ENDPOINT)
    const modal = confirm({
      title: DELETE_PROJECT,
      icon: <ExclamationCircleFilled />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      okButtonProps: { loading: false },
      onOk: async () => {
        modal.update({ okButtonProps: { loading: true } });
        await projectService
          .delete(record.project_id)
          .then((res) => {
            socket.emit('projectDeleted', { ...res.data.data, user: loggedInUser });
            openDialog(PROJECT_DELETE_SUCCESS, "success");
            const newProjectList = allData.filter((project) => project.project_id !== record.project_id)
            setAllData(newProjectList);
            setFilteredData(newProjectList);
            modal.update({ okButtonProps: { loading: false } });
          }).catch((err) => {
            openDialog(err.response && err.response.data || err.message, "error");
            modal.update({ okButtonProps: { loading: false } });
          });
      }
    });
  }, [confirm, openDialog, allData]);

  const columns = [
    {
      title: 'ID',
      dataIndex: "project_id",
      width: '3%',
      sorter: {
        compare: (a, b) => a.project_id - b.project_id,
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'project_name',
      sorter: {
        compare: (a, b) => a.project_name.localeCompare(b.project_name),
      },
    },
    {
      title: 'Language',
      dataIndex: 'language',
      sorter: {
        compare: (a, b) => a.language.localeCompare(b.language),
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      sorter: {
        compare: (a, b) => a.start_date.localeCompare(b.start_date),
      },
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      sorter: {
        compare: (a, b) => a.end_date.localeCompare(b.end_date),
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => {
        return (
          <>
            <Space>
              <Link to={`/project/edit/${record.project_id}`}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Edit
                </Button>
              </Link>
              <Button type="primary" danger onClick={() => showDeleteConfirm(record)} icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Space>
          </>
        );
      },
    }
  ];

  const onSearch = async (searchInput) => {
    try {
      const filteredData = allData.filter((item) => {
        const projectNameMatch = searchInput.project_name
          ? item.project_name
            .toLowerCase()
            .includes(searchInput.project_name.toLowerCase())
          : true;

        const languageMatch = searchInput.language
          ? item.language
            .toLowerCase()
            .includes(searchInput.language.toLowerCase())
          : true;

        return projectNameMatch && languageMatch;
      });

      if (filteredData.length > 0) {
        setFilteredData(filteredData);
      } else {
        setFilteredData(null);
      }
    }
    catch (error) {
      openDialog(error.message, "error");
    }
  };

  const onClear = async () => {
    setFilteredData(allData);
    form.resetFields();
  }

  return (
    <>
      <div>
        <Form
          onFinish={(values) => onSearch(values)}
          form={form}>
          <Row align='top' gutter={16}>
            <Col xl={10} lg={10} md={24} sm={24} xs={24}>
              <Row gutter={16}>
                <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                  <Form.Item name="project_name" style={{ minWidth: '100%' }}>
                    <Input
                      placeholder="Enter Project Name"
                    />
                  </Form.Item>
                </Col>
                <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                  <Form.Item name="language" style={{ minWidth: '100%' }}>
                    <Input placeholder="Enter Language" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xl={14} lg={14} md={24} sm={24} xs={24}>
              <Space align='center' wrap style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <Space size='middle'>
                  <Button htmlType='submit' type="primary" icon={<SearchOutlined />}  >
                    Search
                  </Button>
                  <Button
                    onClick={onClear}
                    type='primary'
                    danger
                    icon={<CloseOutlined />}
                  >
                    Cancel
                  </Button>
                </Space>
                <Link to="/project/add">
                  <Button
                    style={{ backgroundColor: "#00C292", color: "#fff" }}
                    type='primary'
                    icon={<PlusOutlined />}
                  >
                    New Project
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>
        </Form >
      </div >
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isGettingData}
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 5 }} />
      <Dialog />
    </>
  )
}
export default ProjectList;