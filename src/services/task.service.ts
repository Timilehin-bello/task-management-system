import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { prisma } from ".";
import { Request } from "express";
import checkAcessRight from "../utils/checkAccessRight";
import { getProjectById } from "./project.service";

const createTask = async (
  taskBody: Prisma.TaskCreateInput,
  projectId: any,
  user: any
) => {
  try {
    const project = getProjectById(projectId, {
      creator: true,
    });

    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }

    // check if the user is the creator of the project
    if (!checkAcessRight(project, user, ["creator"])) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized to create");
    }

    // create the task
    return await prisma.task.create({
      data: { ...taskBody, projectId },
    });
  } catch (error) {
    throw error;
  }
};

const queryTasks = async (filter: any, options: any) => {
  let orderBy: any = {};
  if (options.sortBy) {
    const [field, direction] = options.sortBy.split(":");
    orderBy[field] = direction === "desc" ? "desc" : "asc";
  }

  const limit =
    options.limit && parseInt(options.limit, 10) > 0
      ? parseInt(options.limit, 10)
      : 10;
  const page =
    options.page && parseInt(options.page, 10) > 0
      ? parseInt(options.page, 10)
      : 1;
  const skip = (page - 1) * limit;

  // Count total tasks matching the filter to calculate total pages
  const totalResults = await prisma.task.count({
    where: filter,
  });

  const tasks = await prisma.task.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
    include: {
      project: true,
    },
  });

  const totalPages = Math.ceil(totalResults / limit);

  const result = {
    tasks,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};

const getTaskById = async (
  id: string | any,
  include?: Prisma.TaskInclude
): Promise<Prisma.TaskWhereUniqueInput | any> => {
  return prisma.task.findUnique({
    where: { id },
    include,
  });
};

const updateTaskById = async (
  req: Request
): Promise<Prisma.TaskUpdateInput> => {
  try {
    const task = await getTaskById(req.params.taskId, {
      project: {
        include: { creator: true },
      },
    });
    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    // check if the user is the creator of the task
    if (!checkAcessRight(task.project, req.user, ["creator"])) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized to update");
    }

    // update the task
    const updatedTask = await prisma.task.update({
      where: { id: req.params.taskId },
      data: req.body,
    });

    return updatedTask;
  } catch (error) {
    throw error;
  }
};

const deleteTaskById = async (user: any, taskId: string) => {
  const task = await getTaskById(taskId, {
    project: {
      include: { creator: true },
    },
  });
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  // check if the user is the creator of the project
  if (!checkAcessRight(task.project, user, ["creator"])) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized to update");
  }

  await prisma.task.delete({ where: { id: taskId } });
  return task;
};

export { createTask, queryTasks, getTaskById, updateTaskById, deleteTaskById };
