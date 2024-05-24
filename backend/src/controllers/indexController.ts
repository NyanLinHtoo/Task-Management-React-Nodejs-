import { employeeController } from './employeeController';
import { authController } from './authController';
import { taskController } from './taskController';

export const controller = {
    employee: employeeController,
    task: taskController,
    auth: authController
};