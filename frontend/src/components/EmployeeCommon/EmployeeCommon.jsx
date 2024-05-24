import { useCallback, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Col,
  Row,
  Typography,
  message,
  Modal,
  Divider,
  Checkbox,
  Spin,
} from 'antd';
import { SaveOutlined, RollbackOutlined, EditOutlined } from '@ant-design/icons';
import { cloudinaryUrl, customRequest } from '../../utils/imageUpload';
import { useParams, useLocation } from 'react-router-dom';
import { employeeService } from '../../services/apiServices';
import { Link } from 'react-router-dom';
import {
  EMAIL_INVALID,
  EMAIL_REQUIRED,
  EMPLOYEE_CREATE_SUCCESSFUL,
  EMPLOYEE_UPDATE_SUCCESSFUL,
  NAME_REQUIRED,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MISMATCH,
  PASSWORD_REQUIRED,
  PASSWORD_SHOULD_NOT_MATCH,
} from '../../constants/message';
import useCommonDialog from '../../hooks/useCommonDialog';
import './employeeCommon.css';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';
import useAuth from '../../hooks/useAuth';

const ENDPOINT = import.meta.env.VITE_ENDPOINT;

const { TextArea } = Input;
const positions = [
  { value: '0', label: "Admin" },
  { value: '1', label: "Member" }
];
const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function EmployeeCommon() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [hideUploadBtn, setHideUploadBtn] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingData, setIsGettingData] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [pageName, setPageName] = useState("");
  const [Dialog, openDialog] = useCommonDialog("/employee/list");
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const { userId, isAdmin } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const addData = useCallback((id) => {
    if (id) {
      employeeService.getOne(id).then((res) => {
        const employeeDetail = res.data;
        const position = positions.filter((position) => position.value === employeeDetail.position || position.label === employeeDetail.position);
        if (position) employeeDetail.position = position[0] && position[0].label;
        setEmail(employeeDetail.email);
        form.setFieldsValue({
          name: employeeDetail.employee_name,
          email: employeeDetail.email,
          address: employeeDetail.address,
          phone: employeeDetail.phone,
          position: employeeDetail.position,
          dob: employeeDetail.dob ? dayjs(employeeDetail.dob) : null,
          profile: employeeDetail.profile
            ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: employeeDetail.profile,
              },
            ]
            : [],
        });
        setIsGettingData(false);
        setHideUploadBtn(true);
      }).catch((err) => {
        setIsGettingData(false);
        openDialog(err.message, "error");
      });
    }
  }, [userId]);

  useEffect(() => {
    setIsGettingData(true);
    if (location.pathname.includes("/profile")) {
      setPageName("Profile");
      setEmployeeId(userId);
      addData(userId);
    } else if (location.pathname.includes("/detail")) {
      setPageName("Detail");
      setEmployeeId(id);
      addData(id);
    } else if (location.pathname.includes("/add")) {
      setPageName("Add");
      form.resetFields();
    } else {
      setPageName("Edit");
      setEmployeeId(id);
      addData(id);
    }
  }, [id, location.pathname, addData, form]);

  const handleProfilePhotoChange = (info) => {
    if (info.file.status === "error") {
      const { error } = info.file.response;
      message.error(error);
    }
    else if (info.file.status === "done") {
      setHideUploadBtn(true);
    }
  };
  const handleCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleProfileRemove = () => {
    setHideUploadBtn(false);
    form.setFieldsValue({ profile: null });
  }
  const onFinish = (values) => {
    const socket = io.connect(ENDPOINT);
    setIsLoading(true);
    delete values.confirmPassword;
    let payload = values;
    let position = values.position;
    if (typeof values.position === "object") {
      position = payload.position.value;
    } else {
      position = positions.filter((position) => position.value === values.position || position.label === values.position);
      position = position[0] ? position[0].value : position;
    }
    payload = {
      ...payload,
      dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      position: position,

      profile:
        (values.profile && values.profile.length !== 0 && values.profile[0].response && values.profile[0].response.url) ||
        (values.profile && values.profile.length !== 0 && values.profile[0].url) ||
        null,
    };
    if (employeeId) {
      employeeService
        .update(employeeId, payload)
        .then((res) => {
          socket.emit('employeeUpdated', { ...res.data.data, user: loggedInUser });
          openDialog(EMPLOYEE_UPDATE_SUCCESSFUL, "success");
          setIsLoading(false);
        })
        .catch((err) => {
          openDialog(err.request.response || err.message, "error");
          setError(err.request.response);
          setIsLoading(false);
        });
    } else {
      employeeService
        .add(payload)
        .then((res) => {
          socket.emit('employeeCreated', { ...res.data, user: loggedInUser });
          openDialog(EMPLOYEE_CREATE_SUCCESSFUL, "success");
          setIsLoading(false);
          setError(null);
        })
        .catch((err) => {
          openDialog(err.request.response || err.message, "error");
          setError(err.request.response);
          setIsLoading(false);
        });
    }
  };
  return (
    <Spin spinning={isGettingData && pageName !== "Add"}>
      <Col
        flex='auto'
        style={{
          padding: "5px 20px 20px 20px",
          borderRadius: 10,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          margin: "auto",
          width: "600px",
        }}
      >
        <Typography.Title level={2} style={{ textAlign: "center", marginTop: 10, marginBottom: 5 }}>
          {pageName === 'Add' && "New Employee"}
          {pageName === 'Edit' && "Edit Employee"}
          {pageName === 'Detail' && "Employee Detail"}
          {pageName === 'Profile' && "Employee Profile"}
        </Typography.Title>
        <Divider />
        <Form
          labelAlign='left'
          form={form}
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
          layout='horizontal'
          onFinish={onFinish}
          initialValues={{
            position: positions[1],
          }}
        >
          <Form.Item
            name='name'
            label={
              <span>
                Name
                {pageName !== 'Profile' && pageName !== 'Detail' && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
              </span>
            }
            required
            rules={[{ required: true, message: NAME_REQUIRED }]}
          >
            <Input disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit} />
          </Form.Item>
          <Form.Item
            name='email'
            validateStatus={error && error.includes("email") ? "error" : ""}
            help={error && error.includes("email") ? error : ""}
            label={
              <span>
                Email
                {pageName !== 'Profile' && pageName !== 'Detail' && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
              </span>
            }
            required
            rules={[
              { required: true, message: EMAIL_REQUIRED },
              { type: "email", message: EMAIL_INVALID },
              () => ({
                validator() {
                  if (error && error.includes("email")) {
                    return Promise.reject(error)
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <Input
              disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit}
              onChange={() => setError(null)}
            />
          </Form.Item>
          <Form.Item
            name='profile'
            label='Profile Photo'
            valuePropName='fileList'
            getValueFromEvent={normFile}
          >
            <Upload
              disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit}
              accept='.jpg,.png'
              listType='picture-card'
              onChange={handleProfilePhotoChange}
              onPreview={handlePreview}
              onRemove={handleProfileRemove}
              maxCount={1}
              customRequest={customRequest}
              action={cloudinaryUrl}
            >
              {!hideUploadBtn && <div>
                <PlusOutlined />
                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  Upload
                </div>
              </div>}
            </Upload>
          </Form.Item>
          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={handleCancel}
          >
            <img alt='example' style={{ width: "100%" }} src={previewImage} />
          </Modal>
          <Form.Item name='address' label='Address'>
            <TextArea rows={4} disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit} />
          </Form.Item>
          <Form.Item name='phone' label='Phone'>
            <InputNumber
              disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit}
              style={{ width: "100%" }}
              min={0}
              maxLength={11}
            />
          </Form.Item>
          <Form.Item name='dob' label='DOB'>
            <DatePicker
              disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name='position'
            label={
              <span>
                Position
                {pageName !== 'Profile' && pageName !== 'Detail' && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
              </span>
            }
            required>
            <Select
              disabled={(isLoading || pageName === "Profile" || pageName === "Detail") && !isEdit || !isAdmin}
              style={{ width: "100%" }}
              options={positions}
            />
          </Form.Item>
          {pageName === "Edit" && (
            <Form.Item
              name='changePassword'
              label='Change Password?'
              valuePropName='checked'
            >
              <Checkbox
                onChange={(e) => setIsChangePassword(e.target.checked)}
              ></Checkbox>
            </Form.Item>
          )}
          {isChangePassword && (
            <>
              <Form.Item
                name='oldPassword'
                label={
                  <span>
                    Old Password
                    {pageName !== 'Profile' && pageName !== 'Detail' && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
                  </span>
                }
                required={id && form.getFieldValue("changePassword")}
                rules={[
                  {
                    required: id && form.getFieldValue("changePassword"),
                    message: `Old Password${PASSWORD_REQUIRED}`,
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name='newPassword'
                label={
                  <span>
                    New Password
                    {pageName !== 'Profile' && pageName !== 'Detail' && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
                  </span>
                }
                required={id && form.getFieldValue("changePassword")}
                rules={[
                  {
                    required: id && form.getFieldValue("changePassword"),
                    message: `New Password${PASSWORD_REQUIRED}`,
                  },
                  { min: 6, message: PASSWORD_MIN_LENGTH },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue("oldPassword") !== value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(PASSWORD_SHOULD_NOT_MATCH);
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name='confirmPassword'
                label={
                  <span>
                    Confirm Password
                    {pageName !== 'Profile' && pageName !== 'Detail' && <span style={{ color: 'red', marginLeft: '5px' }}>*</span>}
                  </span>
                }
                required={id && form.getFieldValue("changePassword")}
                rules={[
                  {
                    required: id && form.getFieldValue("changePassword"),
                    message: `Confirm Password${PASSWORD_REQUIRED}`,
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(PASSWORD_MISMATCH);
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
          {pageName === "Profile" && <div style={{ marginBottom: 10 }}>
            <Link to={`/change-password?email=${email}`}>Change Password?</Link>
          </div>}
          <Row justify='center' gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Link to='/employee/list'>
                <Button
                  type='primary'
                  danger
                  icon={<RollbackOutlined />}
                  size='middle'
                  style={{ width: '100%' }}
                >
                  {pageName === "Detail" ? "Back" : "Cancel"}
                </Button>
              </Link>
            </Col>
            {pageName !== "Profile" && pageName !== "Detail" && (
              <Col xs={24} md={12}>
                <Button
                  size='middle'
                  htmlType='submit'
                  type='primary'
                  loading={isLoading}
                  icon={pageName === 'Edit' ? <EditOutlined /> : <SaveOutlined />}
                  style={{ width: '100%' }}
                >
                  {pageName === 'Edit' ? "Update" : "Save"}
                </Button>
              </Col>
            )}
            {pageName === "Profile" && pageName !== "Detail" && isEdit && (
              <Col xs={24} md={12}>
                <Button
                  size='middle'
                  loading={isLoading}
                  type='primary'
                  htmlType='submit'
                  icon={<SaveOutlined />}
                  style={{ width: '100%' }}
                >
                  Save
                </Button>
              </Col>
            )}
            {pageName === "Profile" && pageName !== "Detail" && !isEdit && (
              <Col xs={24} md={12}>
                <Button
                  size='middle'
                  type='primary'
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsEdit(true);
                  }}
                  style={{ width: '100%' }}
                >
                  Edit
                </Button>
              </Col>
            )}
          </Row>
        </Form>
        <Dialog />
      </Col>
    </Spin>
  );
}
export default EmployeeCommon;
