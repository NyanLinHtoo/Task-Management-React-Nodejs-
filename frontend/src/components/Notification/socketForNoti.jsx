import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
export function useSocketNotifications() {
    const ENDPOINT = import.meta.env.VITE_ENDPOINT;
    const [notifications, setNotifications] = useState([]);
    const onRead = (notification) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((item) =>
                item.id === notification.id ? { ...item, read: true } : item
            )
        );
    };
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const socket = io(ENDPOINT);
        socket.emit('login', loggedInUser);
        // Employee Notifications
        socket.on('createEmployeeNotifications', (data) => {
            const newEmployeeNotification = {
                id: `create-${data.id}`,
                projectName: data.employee_name,
                description: <>New employee created: <b><i>{data.employee_name}</i></b></>,
                read: false
            };
            setNotifications(prevNotifications => [...prevNotifications, newEmployeeNotification]);
        });

        socket.on('updateEmployeeNotifications', (data) => {
            const newEmployeeNotification = {
                id: `update-${data.id}`,
                projectName: data.employee_name,
                description: <>Employee <b><i>{data.employee_name}</i></b> updated</>,
                read: false
            };
            setNotifications(prevNotifications => {
                const index = prevNotifications.findIndex((n) => n.id === data.employee_id);
                if (index !== -1) {
                    prevNotifications[index] = newEmployeeNotification;
                    return [...prevNotifications];
                } else {
                    return [...prevNotifications, newEmployeeNotification];
                }
            });
        });
        socket.on('deleteEmployeeNotifications', (data) => {
            const newEmployeeNotification = {
                id: `delete-${data.id}`,
                projectName: data.employee_name,
                description: <>Employee <b><i>{data.employee_name}</i></b> is deleted</>,
                read: false
            };
            setNotifications(prevNotifications => [...prevNotifications, newEmployeeNotification]);
        });
        // Project Notifications
        socket.on('createProjectNotifications', (data) => {
            const newProjectNotification = {
                id: `create-${data.id}`,
                projectName: data.project_name,
                description: <>New project created: <b><i>{data.project_name}</i></b> </>,
                read: false,
            };
            setNotifications(prevNotifications => [...prevNotifications, newProjectNotification]);
        });
        socket.on('updateProjectNotifications', (data) => {
            const newProjectNotification = {
                id: `update-${data.id}`,
                projectName: data.project_name,
                description: <>Project <b><i>{data.project_name}</i></b> is updated</>,
                read: false,
            };
            setNotifications(prevNotifications => {
                const index = prevNotifications.findIndex((n) => n.id === data.project_id);
                if (index !== -1) {
                    prevNotifications[index] = newProjectNotification;
                    return [...prevNotifications];
                } else {
                    return [...prevNotifications, newProjectNotification];
                }
            });
        });
        socket.on('deleteProjectNotifications', (data) => {
            const newProjectNotification = {
                id: `delete-${data.id}`,
                projectName: data.project_name,
                description: <>Project <b><i>{data.project_name}</i></b> is deleted</>,
                read: false,
            };
            setNotifications(prevNotifications => [...prevNotifications, newProjectNotification]);
        });
        // Task Notifications
        socket.on('createTaskNotifications', (data) => {
            const assignTask = () => {
                if (data.assigned_member_id === loggedInUser.id) {
                    return (
                        <>
                            New task <b><i>{data.title}</i></b> created.<br />
                            You have been assigned to task <b><i>{data.title}</i></b>
                        </>)
                } else {
                    return <>New task <b><i>{data.title}</i></b> created.</>
                }
            }
            const newProjectNotification = {
                id: `create-${data.id}`,
                projectName: data.title,
                description: assignTask(),
                read: false,
            };
            setNotifications(prevNotifications => [...prevNotifications, newProjectNotification]);
        });
        socket.on('updateTaskNotifications', (data) => {
            const assignTask = () => {
                if (data.assigned_member_id === loggedInUser.id) {
                    return (
                        <>
                            Task <b><i>{data.title}</i></b> is updated.<br />
                            You have been assigned to task <b><i>{data.title}</i></b>.
                        </>
                    )
                } else {
                    return <>Task <b><i>{data.title}</i></b> is updated</>
                }
            }
            const newProjectNotification = {
                id: `update-${data.id}`,
                projectName: data.title,
                description: assignTask(),
                read: false,
            };
            setNotifications(prevNotifications => {
                const index = prevNotifications.findIndex((n) => n.id === data.project_id);
                if (index !== -1) {
                    prevNotifications[index] = newProjectNotification;
                    return [...prevNotifications];
                } else {
                    return [...prevNotifications, newProjectNotification];
                }
            });
        });
        return () => {
            socket.disconnect();
        };
    }, []);
    return { notifications, onRead };
}