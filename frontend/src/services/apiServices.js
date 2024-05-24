import create from './httpService';

export const employeeService = create("/employee");
export const projectService = create("/project");
export const taskService = create("/task");
export const reportService = create("/report");