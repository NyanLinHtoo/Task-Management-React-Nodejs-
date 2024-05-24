import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import useCommonDialog from './../../hooks/useCommonDialog';
import useAuth from './../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ModalForm from './ModalForm';
import loginService from '../../services/loginService';
const { Title } = Typography;

export default function LoginForm() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const password = params.get('password');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerify, setIsVerify] = useState(false);
  const [isVerifiedMail, setIsVerifiedMail] = useState(null);
  const [Dialog, openDialog] = useCommonDialog();
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginForm] = Form.useForm();

  const getButtonColor = () => {
    switch (isVerifiedMail) {
      case true:
        return {
          backgroundColor: '#0ef019',
          color: '#fff'
        }
      case false:
        return {
          backgroundColor: '#ff0000',
          color: '#fff'
        }
      default:
        return {
          backgroundColor: '#fff',
          color: '#000'
        }
    }
  }
  const onFinish = (values) => {
    setIsLoading(true);
    login(values).then(() => {
      message.success('Login successful');
      navigate('/dashboard');
    }).catch((err) => {
      setIsLoading(false);
      openDialog((err.response && err.response.data.error) || err.message, 'error');
    })
  };

  useEffect(() => {
    if (email && password) {
      loginForm.setFieldsValue({
        email,
        password
      })
    }
  }, [email, password]);

  const handleOk = () => {
    setOpenModal(false);
  };

  const handleSubmit = (email) => {
    if (email) {
      setIsVerify(true);
      handleOk();
      loginService.sendVerificationMail({ email }).then((res) => {
        setIsVerify(false);
        setIsVerifiedMail(true);
        message.success(res.data.message);
      }).catch((err) => {
        setIsVerify(false);
        setIsVerifiedMail(false);
        openDialog((err.response && err.response.data.error) || err.message, 'error');
      })
    }
  };

  return (
    <>
      <Form
        name="normal_login"
        className="login-form"
        form={loginForm}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{
          padding: "20px 20px 1px",
          borderRadius: 10,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <Title level={3} style={{ marginTop: 0, marginBottom: 30, textAlign: 'center' }}>Login to Your Account</Title>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your Email!' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            autoComplete='email'
            placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            autoComplete='password'
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item style={{ width: '100%' }}>
          <div style={{ width: '100%', display: 'inline-flex', justifyContent: 'space-between' }} >
            <Button style={{ minWidth: '75%' }} loading={isLoading} type="primary" htmlType="submit">
              Log in
            </Button>
            <Button loading={isVerify} style={{ minWidth: '20%', ...getButtonColor() }} onClick={() => setOpenModal(true)}>
              Verify
            </Button>
          </div>
        </Form.Item>
        <Form.Item style={{
          textAlign: 'center'
        }}>
          <Link
            to='/forget-password'
          >
            Forgot password?
          </Link>
        </Form.Item>
      </Form>
      <Dialog />
      <ModalForm open={openModal} onCancel={() => setOpenModal(false)} onOk={handleOk} onSubmit={handleSubmit} />
    </>
  );
}
