import {
  Button,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Divider
} from 'antd';
import {
  SaveOutlined,
  RollbackOutlined,
  EditOutlined
} from "@ant-design/icons"
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  DATE_VALIDATE,
  PROJECT_CREATE_FAILED,
  PROJECT_CREATE_SUCCESS,
  PROJECT_END_DATE,
  PROJECT_LANGUAGE,
  PROJECT_NAME,
  PROJECT_START_DATE,
  PROJECT_UPDATE_FAILED,
  PROJECT_UPDATE_SUCCESS
} from '../../constants/message';
import useCommonDialog from '../../hooks/useCommonDialog';
import './ProjectCommon.css'
import { projectService } from '../../services/apiServices';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';
const ENDPOINT = import.meta.env.VITE_ENDPOINT;

function ProjectCommon() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [Dialog, openDialog] = useCommonDialog('/project/list');
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const validateEndDate = ({ getFieldValue }) => ({
    validator(_, value) {
      return new Promise((resolve, reject) => {
        const startDate = getFieldValue('start_date');
        if (!startDate || !value) {
          resolve();
        }
        else if (startDate && value) {
          if (startDate > value) {
            reject(new Error(DATE_VALIDATE));
          } else {
            resolve();
          }
        }
      }
      )
    }
  })

  useEffect(() => {
    if (location.pathname.includes("/add")) {
      form.resetFields();
    }
  }, [location.pathname])

  useEffect(() => {
    const fetchProjectData = async () => {
      if (id) {
        projectService.getOne(id)
          .then(res => {
            form.setFieldsValue({
              project_name: res.data.data.project_name,
              language: res.data.data.language,
              description: res.data.data.description,
              start_date: dayjs(res.data.data.start_date),
              end_date: dayjs(res.data.data.end_date)
            });
          })
      }
    }
    fetchProjectData();
  }, [id, form]);

  const handleSubmit = (values) => {
    const socket = io.connect(ENDPOINT)
    const payload = values;
    if (!id) {
      setLoading(true);
      projectService
        .add(payload)
        .then((res) => {
          socket.emit('projectCreated', { ...res.data.data, user: loggedInUser });
          openDialog(PROJECT_CREATE_SUCCESS, "Success");
          setLoading(false);
        })
        .catch(() => {
          openDialog(PROJECT_CREATE_FAILED, "error");
          setLoading(false);
        })
    } else {
      setLoading(true);
      projectService
        .update(id, payload)
        .then((res) => {
          socket.emit('projectUpdated', { ...res.data.data, user: loggedInUser });
          openDialog(PROJECT_UPDATE_SUCCESS, "Success");
          setLoading(false);
        })
        .catch(() => {
          openDialog(PROJECT_UPDATE_FAILED, "error");
          setLoading(false);
        })
    }
  }

  return (
    <>
      <div style={{
        maxWidth: 600,
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
          {id ? 'Update Project' : 'New Project'}
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
                Project Name
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="project_name"
            rules={[{ required: true, message: PROJECT_NAME }]}
          >
            <Input placeholder="Enter Project Name" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Language
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="language"
            rules={[{ required: true, message: PROJECT_LANGUAGE }]}
          >
            <Input placeholder="Enter Language" />
          </Form.Item>
          <Form.Item
            label='Description'
            justify="space-between"
            name="description">
            <Input placeholder="Enter Description" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Start Date
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="start_date"
            rules={[{ required: true, message: PROJECT_START_DATE }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="yyyy-mm-dd"
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                End Date
                <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
              </span>
            }
            justify="space-between"
            name="end_date"
            rules={[{ required: true, message: PROJECT_END_DATE }, validateEndDate]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="yyyy-mm-dd"
            />
          </Form.Item>
          <Row justify='center' gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Link to="/project/list">
                <Button
                  type="primary"
                  danger
                  icon={<RollbackOutlined />}
                  style={{ width: '100%' }}
                >
                  Cancel
                </Button>
              </Link>
            </Col>
            <Col xs={24} md={12}>
              <Button
                type="primary"
                htmlType='submit'
                loading={loading}
                icon={id ? (<EditOutlined />) : (<SaveOutlined />)}
                style={{ width: '100%' }}
              >
                {id ? 'Update' : 'Save'}
              </Button>
            </Col>
          </Row>
        </Form>
        <Dialog />
      </div >
    </>
  );
}

export default ProjectCommon;