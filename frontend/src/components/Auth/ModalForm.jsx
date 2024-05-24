import { Modal, Form, Input } from 'antd';
import { EMAIL_INVALID } from './../../constants/message';
import propTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';

const checkEmailWithRegex = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/;
  return regex.test(email);
}

const useResetFormOnCloseModal = ({ form, open, setEmail }) => {
  const prevOpenRef = useRef();
  useEffect(() => {
    prevOpenRef.current = open;
  }, [open]);
  const prevOpen = prevOpenRef.current;
  useEffect(() => {
    if (!open && prevOpen) {
      form.resetFields();
      setEmail('');
    }
  }, [form, prevOpen, open, setEmail]);
};

function ModalForm({ open, onCancel, onSubmit }) {
  const [email, setEmail] = useState('');
  const [form] = Form.useForm();
  useResetFormOnCloseModal({
    form,
    open,
    setEmail
  });

  const onFinish = () => {
    if (checkEmailWithRegex(email)) {
      return onSubmit(email);
    }
  };

  const onHandleChange = (event) => {
    setEmail(event.target.value);
  }

  return (
    <Modal title='Email Verification Form' open={open} onOk={onFinish} onCancel={onCancel} centered>
      <Form form={form}>
        <Form.Item name="email" rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: EMAIL_INVALID }
        ]}>
          <Input type='email' placeholder='Please enter your email' onChange={onHandleChange} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

ModalForm.propTypes = {
  open: propTypes.bool,
  onCancel: propTypes.func,
  onOk: propTypes.func,
  onSubmit: propTypes.func,
}

export default ModalForm;