import { useNavigate } from 'react-router';
import CommonDialog from '../components/CommonDialog/CommonDialog';
import { useState } from 'react';

export default function useCommonDialog(path) {
  const [modalDescription, setModalDescription] = useState({
    text: "",
    type: "",
    open: false,
  });
  const navigate = useNavigate();

  const handleModalOK = () => {
    setModalDescription({
      ...modalDescription,
      open: false,
    });
    if (modalDescription.type === "Success") navigate(path || modalDescription.path);
  };

  const openDialog = (text, type, path) => {
    type = type.toLowerCase() === "success" ? "Success" : "Error";
    setModalDescription({
      ...modalDescription,
      text,
      type,
      open: true,
      path,
    });
  }

  const Dialog = () => {
    return (
      <CommonDialog {...modalDescription} onOk={handleModalOK} />
    )
  };

  return [Dialog, openDialog];
}
