import { Card, Form, Input, Button } from 'antd';
import { useState } from 'react';
import useAuth from './../../hooks/useAuth';
import useCommonDialog from '../../hooks/useCommonDialog';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { forgetPassword } = useAuth();
  const [Dialog, openDialog] = useCommonDialog();
  const onFinish = (values) => {
    setIsLoading(true);
    forgetPassword(values).then((res) => {
      setIsLoading(false);
      openDialog('Reset Password sent successfully', 'success', res ? '/login' : '/forget-password');
    }).catch((err) => {
      setIsLoading(false);
      openDialog((err.response && err.response.data.error) || err.message, 'error');
    });
  }

  return (
    <>
      <Card title="Forgot Password" bordered={false} style={{ width: 500, margin: '0 auto' }}>
        <Form
          name="normal_forgot"
          className="forgot-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter your email here' }]}
          >
            <Input placeholder='Enter your E-mail here' />
          </Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            className="forget-form-button"
            loading={isLoading}
          >
            Reset
          </Button>
        </Form>
      </Card>
      <Dialog />
    </>
  );
}

