/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';
import App from '../App';
import ErrorPage from '../components/ErrorPage/ErrorPage';
import LoginForm from '../components/Auth/Login';
import ForgotPassword from '../components/Auth/ForgetPassword';
import ChangePassword from '../components/Auth/ChangePassword';
import { lazy, Suspense } from 'react';
import { Space, Spin } from 'antd';
import AdminRoutes from './AdminRoutes';

// Lazy Components
const VerifyAccountPage = lazy(() => import('../components/Auth/VerifyAccountPage'));
const Dashboard = lazy(() => import('../components/Dashboard/DashBoard'));
const EmployeeCommon = lazy(() => import('../components/EmployeeCommon/EmployeeCommon'));
const EmployeeList = lazy(() => import('../components/EmployeeList/EmployeeList'));
const ProjectCommon = lazy(() => import('../components/ProjectCommon/ProjectCommon'));
const ProjectList = lazy(() => import('../components/ProjectList/ProjectList'));
const TaskList = lazy(() => import('../components/Task/TaskList'));
const CommonTask = lazy(() => import('../components/Task/CommonTask'));
const ReportList = lazy(() => import('../components/Report/ReportList'));
const ReportCreate = lazy(() => import('../components/Report/ReportCreate'));
const ResetPassword = lazy(() => import('../components/Auth/ResetPassword'));

const fallback = (
  <Space
    direction='vertical'
    align='center'
    style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
  >
    <Spin size="large" />
  </Space>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: "login",
        element: <LoginForm />,
        errorElement: <ErrorPage />,
      },
      {
        path: "verify/:id",
        element: <VerifyAccountPage />,
      },
      {
        path: "forget-password",
        element: <ForgotPassword />
      },
      {
        path: "change-password",
        element: <ChangePassword />
      },
      {
        path: "reset-password",
        element: <ResetPassword />
      },
      {
        element: <PrivateRoutes />,
        errorElement: <ErrorPage />,
        children: [
          {
            element: <AdminRoutes />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: "employee/add",
                element: (
                  <Suspense fallback={fallback}>
                    <EmployeeCommon />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "employee/edit/:id",
                element: (
                  <Suspense fallback={fallback}>
                    <EmployeeCommon />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "employee/list",
                element: (
                  <Suspense fallback={fallback}>
                    <EmployeeList />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "employee/detail/:id",
                element: (
                  <Suspense fallback={fallback}>
                    <EmployeeCommon />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "project/add",
                element: (
                  <Suspense fallback={fallback}>
                    <ProjectCommon />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "project/edit/:id",
                element: (
                  <Suspense fallback={fallback}>
                    <ProjectCommon />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "project/list",
                element: (
                  <Suspense fallback={fallback}>
                    <ProjectList />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              }
            ]
          },
          {
            path: "dashboard",
            element: (
              <Suspense fallback={fallback}>
                <Dashboard />
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={fallback}>
                <EmployeeCommon />
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "task/list",
            element: (
              <Suspense fallback={fallback}>
                <TaskList />
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "task/add",
            element: (
              <Suspense fallback={fallback}>
                <CommonTask />
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "task/edit/:id",
            element: (
              <Suspense fallback={fallback}>
                <CommonTask />
              </Suspense>
            )
          },
          {
            path: "report/list",
            element: (
              <Suspense fallback={fallback}>
                <ReportList />
              </Suspense>
            )
          },
          {
            path: "report/add",
            element: (
              <Suspense fallback={fallback}>
                <ReportCreate />
              </Suspense>
            )
          },
          {
            path: "report/list",
            element: (
              <Suspense fallback={fallback}>
                <ReportList />
              </Suspense>
            )
          },
          {
            path: "*",
            element: <ErrorPage />,
          },
          { path: "*", element: <ErrorPage /> },
        ],
      },
    ]
  }]);

export default router;

