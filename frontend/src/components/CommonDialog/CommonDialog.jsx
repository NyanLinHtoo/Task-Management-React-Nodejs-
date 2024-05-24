import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

function CommonDialog({ text, type, open, onOk }) {
  type = type.toLowerCase() === 'success' ? 'Success' : 'Error';
  return (
    <Modal
      title={<div style={{ fontSize: '24px' }}>{type}</div>}
      open={open}
      onCancel={onOk}
      centered={true}
      width={300}
      style={{ textAlign: 'center' }}
      footer={[
        <div key="ok" style={{ textAlign: 'center' }}>
          <Button type="primary" onClick={onOk}>
            OK
          </Button>
        </div>
      ]}
    >
      <div style={{ textAlign: 'center', fontSize: '30px', color: `${type === 'Success' ? 'green' : 'red'}` }}>
        {type === 'Success' ? <CheckCircleFilled /> : <CloseCircleFilled />}
      </div>
      <p style={{ textAlign: 'center', color: `${type === 'Success' ? 'green' : 'red'}` }}>{text}</p>
    </Modal>
  )
}

CommonDialog.propTypes = {
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired
}

export default CommonDialog;