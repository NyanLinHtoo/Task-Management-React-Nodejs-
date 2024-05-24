import { createProjectServices, deleteProjectServices, getProjectByIdServices, getProjectServices, updateProjectServices } from "../services/projectService"
import { Request, Response } from "express";

export const getProject = async (_req: Request, res: Response) => {
    getProjectServices(_req, res)
}

export const getProjectById = async (req: Request, res: Response) => {
    getProjectByIdServices(req, res)
}

export const createProject = async (req: Request, res: Response) => {
    createProjectServices(req, res)
}

export const updateProject = async (req: Request, res: Response) => {
    updateProjectServices(req, res)
}

export const deleteProject = async (req: Request, res: Response) => {
    deleteProjectServices(req, res)
}