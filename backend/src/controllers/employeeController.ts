import * as employeeServices from '../services/employeeService';

export const employeeController = {
    getAll: employeeServices.getAll,
    getById: employeeServices.getOneById,
    create: employeeServices.create,
    update: employeeServices.update,
    delete: employeeServices.deleteOne
};
