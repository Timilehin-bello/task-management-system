import httpStatus from "http-status";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { projectService } from "../services";
import { Request, Response } from "express";

const addProject = catchAsync(async (req: any, res: Response) => {
  const newBody = { ...req.body, creatorId: req.user.id };
  const project = await projectService.createProject(newBody);
  res.status(httpStatus.CREATED).send({
    status: "success",
    data: project,
  });
});

const getProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "name",
    "brand",
    "rating",
    "price",
    "size",
    "stockQuantity",
    "categoryName",
  ]);
  const options = pick(req.query, ["sortBy", "sequence", "limit", "page"]);
  const result = await projectService.queryProjects(filter, options);
  res.status(httpStatus.OK).send({
    status: "success",
    data: result,
  });
});

const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId, {
    tasks: {
      select: {
        completed: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    },
    collaborators: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  });
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }
  res.status(httpStatus.OK).send({
    status: "success",
    data: project,
  });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.updateProjectById(req);
  res.status(httpStatus.OK).send({
    status: "success",
    data: project,
  });
});

const deleteProject = catchAsync(async (req: any, res: Response) => {
  await projectService.deleteProjectById(req.user, req.params.projectId);
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Project deleted successfully",
  });
});

const addCollaborator = catchAsync(async (req: any, res: Response) => {
  const newBody = { ...req.body, user: req.user };
  const project = await projectService.addCollaborator(
    req.params.projectId,
    newBody
  );
  res.status(httpStatus.CREATED).send({
    status: "success",
    data: project,
  });
});

const deleteCollaborator = catchAsync(async (req: any, res: Response) => {
  const newBody = { ...req.body, user: req.user };
  await projectService.deleteCollaborator(req.params.projectId, newBody);
  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "Collaborator deleted successfully",
  });
});

export {
  addProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addCollaborator,
  deleteCollaborator,
};
