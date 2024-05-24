import { Result, Button } from 'antd';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import loginService from '../../services/loginService';

function VerifyAccountPage() {
  const [response, setResponse] = useState({
    status: 'info',
    message: 'Validating your account...'
  });
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  let redirectPage = params.get('redirectTo');
  const email = params.get('email');
  const password = params.get('password');
  redirectPage = redirectPage + '?email=' + email + '&password=' + password;

  useEffect(() => {
    loginService.verifyAccount({ token: token })
      .then(res => {
        setResponse({
          status: 'success',
          message: res.data
        });
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          setResponse({
            status: 'error',
            message: err.response.data.error
          });
        } else {
          setResponse({
            status: 'error',
            message: 'An error occurred. Please try again later.'
          });
        }
      });
  }, [token]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status={response.status}
        title={response.message || 'Invalid URL'}
        extra={[
          response.status === 'success' && (
            <Button type="primary" key={redirectPage} onClick={() => {
              navigate(redirectPage)
            }}>
              Go to Log in Page
            </Button>
          )
        ]}
      />
    </div>
  )
}

export default VerifyAccountPage