import { Form, Button, Card, Input } from 'antd';
import { useState } from 'react';
import useAuth from './../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import useCommonDialog from '../../hooks/useCommonDialog';
import jwt from 'jwt-decode';
import { PASSWORD_SHOULD_NOT_MATCH } from '../../constants/message';

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [Dialog, openDialog] = useCommonDialog();
  const { resetPassword } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  const userDetail = jwt(token);

  const onFinish = (values) => {
    setIsLoading(true);
    resetPassword(values, userDetail.userId).then((res) => {
      setIsLoading(false);
      openDialog('Reset Password Successful', 'success', res ? '/login' : '/reset-password');
    }).catch((err) => {
      setIsLoading(false);
      openDialog((err.response && err.response.data.error) || err.message, 'error');
    });
  };

  return (
    <div>
      <Card title="Reset Password Form" className="resetPsw" style={{ width: 500, margin: '0 auto' }}>
        <Form name="normal_resetPassword" initialValues={{ remember: true }} className="reset-form" onFinish={onFinish}>
          <Form.Item name="newPassword" rules={[{ required: true, message: 'Please enter your new password' }]}>
            <Input.Password
              autoComplete="new-password"
              placeholder="Enter your new password"

            />
          </Form.Item>
          <Form.Item name="confirmPassword"
            rules={[
              { required: true, message: 'Please enter your confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(PASSWORD_SHOULD_NOT_MATCH));
                },
              })
            ]}>
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
