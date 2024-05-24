import { Server as SocketIOServer, Socket } from 'socket.io';
import { generateId } from './utils/generateId';

export function configureSocket(server: any) {

    const io = new SocketIOServer(server, {
        cors: {
            origin: '*'
        },
    });
    const userSockets = new Map();

    io.on('connection', (socket: Socket) => {
        socket.on('login', (user: any) => {
            userSockets.set(user, socket);
        });

        // Employee CRUD Notifications
        socket.on('employeeCreated', (data: any) => {
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (user.id !== data.user.id && user.type === data.user.type) {
                    userSocket.emit('createEmployeeNotifications', { ...data, id });
                }
            });
        });

        socket.on('employeeUpdated', (data: any) => {
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (user.id !== data.user.id && user.type === data.user.type) {
                    userSocket.emit('updateEmployeeNotifications', { ...data, id });
                }
            });
        });

        socket.on('employeeDeleted', (data: any) => {
            const id = generateId(3)
            userSockets.forEach((userSocket, user) => {
                if (user.id !== data.user.id && user.type === data.user.type) {
                    userSocket.emit('deleteEmployeeNotifications', { ...data, id });
                }
            });
        });

        // Project CRUD Notifications
        socket.on('projectCreated', (data: any) => {
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (user.id !== data.user.id && user.type === data.user.type) {
                    userSocket.emit('createProjectNotifications', { ...data, id });
                }
            });
        });

        socket.on('projectUpdated', (data: any) => {
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (user.id !== data.user.id && user.type === data.user.type) {
                    userSocket.emit('updateProjectNotifications', { ...data, id });
                }
            });
        });

        socket.on('projectDeleted', (data: any) => {
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (user.id !== data.user.id && user.type === data.user.type) {
                    userSocket.emit('deleteProjectNotifications', { ...data, id });
                }
            });
        });

        // Task Notifications
        socket.on('taskCreated', (data: any) => {
            const assignMemberId = data.assigned_member_id;
            const userInfo = data.user;
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (userInfo.type === 0 || userInfo.type === 1) {
                    if (user.id !== userInfo.id && user.type === 0) {
                        if (user.id === assignMemberId) {
                            userSocket.emit('createTaskNotifications', { ...data, id });
                        } else {
                            userSocket.emit('createTaskNotifications', { ...data, id });
                        }
                    }
                }
            });
        });

        socket.on('taskUpdated', (data: any) => {
            const assignMemberId = data.assigned_member_id;
            const userInfo = data.user;
            const id = generateId(3);
            userSockets.forEach((userSocket, user) => {
                if (userInfo.type === 0 || userInfo.type === 1) {
                    if (user.id !== userInfo.id && user.type === 0) {
                        if (user.id === assignMemberId) {
                            userSocket.emit('updateTaskNotifications', { ...data, id });
                        } else {
                            userSocket.emit('updateTaskNotifications', { ...data, id });
                        }
                    }
                }
            });
        });
    });
}