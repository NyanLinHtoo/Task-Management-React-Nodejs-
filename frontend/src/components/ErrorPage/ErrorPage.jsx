import { Result } from 'antd';
import { useRouteError } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function ErrorPage() {
  const location = useLocation();
  const pathName = location.pathname;
  const error = useRouteError();
  const status = error && error.status || 404;
  const title = error && (error.message || error.data) || `Requested page '${pathName}' not found`;
  return (
    <Result status={status} title={status} subTitle={title} />
  )
}

export default ErrorPage