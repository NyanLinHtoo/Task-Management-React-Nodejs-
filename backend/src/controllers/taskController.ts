import * as taskService from "../services/taskService";

export const taskController = {
    getAll: taskService.getAll,
    getById: taskService.getOneById,
    create: taskService.create,
    update: taskService.update,
    delete: taskService.deleteOne
};