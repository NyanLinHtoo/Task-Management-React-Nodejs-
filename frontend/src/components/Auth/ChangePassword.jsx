import { Form, Button, Card, Input } from 'antd';
import { useState } from 'react';
import useAuth from './../../hooks/useAuth';
import useCommonDialog from '../../hooks/useCommonDialog';
import { useLocation } from 'react-router-dom';

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [Dialog, openDialog] = useCommonDialog();
  const { changePassword } = useAuth();
  const [form] = Form.useForm();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get('email');

  if (email) {
    form.setFieldsValue({ email: email });
  }
  const onFinish = (values) => {
    setIsLoading(true);
    changePassword(values).then((res) => {
      setIsLoading(false);
      openDialog('Changed Password Successful', 'success', res ? '/login' : '/change-password');
    }).catch((err) => {
      openDialog((err.response && err.response.data.error) || err.message, 'error');
    })
    setIsLoading(false);
  };

  return (
    <div>
      <Card title="Change Password Form" className="changePsw" style={{ width: 500, margin: '0 auto' }}>
        <Form form={form} name="normal_resetPassword" initialValues={{ remember: true }} className="reset-form" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email here' }]}>
            <Input type="email" placeholder="Enter your email address" />
          </Form.Item>
          <Form.Item name="oldPassword" rules={[{ required: true, message: 'Please enter your old password' }]}>
            <Input.Password
              autoComplete="old-password"
              placeholder="Enter your old password"

            />
          </Form.Item>
          <Form.Item name="newPassword" rules={[{ required: true, message: 'Please enter your new password' }]}>
            <Input.Password
              autoComplete="new-password"
              placeholder="Enter your new password"
            />
          </Form.Item>
          <Form.Item name="confirmPassword" rules={[{ required: true, message: 'Please enter your confirm password' }]}>
            <Input.Password
              autoComplete="confirm-password"
              placeholder="Enter your confirm password"
            />
          </Form.Item>
          <Button loading={isLoading} type="primary" htmlType="submit" className="reset-form-button">
            Update
          </Button>
        </Form>
      </Card>
      <Dialog />
    </div>
  );
}
