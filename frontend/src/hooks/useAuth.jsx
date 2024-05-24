import { useState, useEffect } from 'react';
import loginService from '../services/loginService';
import jwt from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';

export default function useAuth() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    const user = userFromStorage ? JSON.parse(userFromStorage) : null;
    if (tokenFromStorage && user) {
      setToken(tokenFromStorage);
      setUserId(user.id);
      setLoggedInUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.type === 0);
    } else {
      setToken(null);
      setUserId(null);
      setLoggedInUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, [pathname]);

  const login = (payload) => {
    return loginService.login(payload)
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem('token', token);
        setToken(token);

        const userDetail = jwt(token);
        const user = {
          id: userDetail.userId,
          type: parseInt(userDetail.type),
        };

        localStorage.setItem('user', JSON.stringify(user));
        setUserId(user.id);
        setLoggedInUser(user);
        setIsAuthenticated(true);
        setIsAdmin(user.type === 0);

        return user;
      })
      .catch((err) => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        throw err;
      });
  };

  const changePassword = (payload) => {
    return loginService.changePassword(payload)
      .then((res) => {
        setEmail(email);
        setNewPassword(newPassword);
        setOldPassword(oldPassword);
        setConfirmPassword(confirmPassword);
        return Promise.resolve(res.data);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  const resetPassword = (payload, id) => {
    return loginService.resetPassword(payload, id)
      .then((res) => {
        setNewPassword(newPassword);
        setConfirmPassword(confirmPassword);
        return Promise.resolve(res.data);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  const forgetPassword = (payload) => {
    return loginService.forgetPassword(payload)
      .then((res) => {
        setEmail(email);
        setNewPassword(newPassword);
        return Promise.resolve(res.data);
      })
      .catch((err) => {
        return Promise.reject(err);
      })
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUserId(null);
    setLoggedInUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/login');
  };

  return {
    token,
    isAuthenticated,
    isAdmin,
    userId,
    loggedInUser,
    login,
    logout,
    changePassword,
    forgetPassword,
    resetPassword
  };
}
