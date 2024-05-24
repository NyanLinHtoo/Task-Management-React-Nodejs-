import { message } from 'antd';
import { INVALID_FILE_TYPE } from '../constants/message';

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_API_KEY;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

const isValidImageFile = (file) => {
  const validTypes = ["image/jpg", "image/png", "image/jpeg"];
  if (validTypes.indexOf(file.type) === -1) {
    message.error(`${file.name} is not a valid image file.`);
    return false;
  }
  return true;
};

export const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export function customRequest({ action, file, onSuccess, onError }) {
  const isValid = isValidImageFile(file);
  if (!isValid) {
    onError(INVALID_FILE_TYPE);
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "employee");
  formData.append("api_key", API_KEY);

  fetch(action, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => onSuccess(result))
    .catch((error) => {
      onError(error);
    });
}
