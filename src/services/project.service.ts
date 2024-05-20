import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { prisma } from ".";
import { Request } from "express";
import checkAcessRight from "../utils/checkAccessRight";

const createProject = async (projectBody: Prisma.ProjectCreateInput) => {
  try {
    return await prisma.project.create({
      data: projectBody,
    });
  } catch (error) {
    throw error;
  }
};
const queryProjects = async (filter: any, options: any) => {
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

  // Count total projects matching the filter to calculate total pages
  const totalResults = await prisma.project.count({
    where: filter,
  });

  const projects = await prisma.project.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
    include: {
      collaborators: true,
      creator: true,
    },
  });

  const totalPages = Math.ceil(totalResults / limit);

  const result = {
    projects,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};

const getProjectById = async (
  id: string,
  include?: Prisma.ProjectInclude
): Promise<Prisma.ProjectWhereUniqueInput | any> => {
  return prisma.project.findUnique({
    where: { id },
    include,
  });
};

const updateProjectById = async (
  req: Request
): Promise<Prisma.ProjectUpdateInput> => {
  try {
    const project = await getProjectById(req.params.projectId, {
      creator: true,
    });
    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }

    // check if the user is the creator of the project
    if (!checkAcessRight(project, req.user, ["creator"])) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized to update");
    }

    const updatedProject = await prisma.project.update({
      where: { id: req.params.projectId },
      data: req.body,
    });

    return updatedProject;
  } catch (error) {
    throw error;
  }
};

const deleteProjectById = async (user: any, projectId: string) => {
  const project = await getProjectById(projectId, {
    creator: true,
  });
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  // check if the user is the creator of the project
  if (!checkAcessRight(project, user, ["creator"])) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized to update");
  }

  await prisma.project.delete({ where: { id: projectId } });
  return project;
};

const addCollaborator = async (projectId: string, newBody: any) => {
  const project = await getProjectById(projectId, {
    creator: true,
    collaborators: true,
  });
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  const getUser = await prisma.user.findUnique({
    where: {
      id: newBody.email,
    },
  });
  if (!getUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // check if the user is the creator or collaborator of the project
  if (!checkAcessRight(project, newBody.user, ["creator", "collaborator"])) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized ");
  }

  // check if the user is already a collaborator
  if (checkAcessRight(project, newBody.user, ["collaborator"])) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "User is already a collaborator"
    );
  }

  // // check if the user is already a collaborator
  // if (!checkAcessRight(project, user, ["collaborator"])) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, "User is already a collaborator");
  // }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      collaborators: {
        connect: {
          id: getUser.id,
        },
      },
    },
  });
};

const deleteCollaborator = async (projectId: string, collaboratorBody: any) => {
  const project = await getProjectById(projectId, {
    creator: true,
  });
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  const getUser = await prisma.user.findUnique({
    where: {
      email: collaboratorBody.email,
    },
  });
  if (!getUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // check if the user is the creator  of the project
  if (!checkAcessRight(project, collaboratorBody.user, ["creator"])) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Not authorized ");
  }

  const projectCollaborators = await prisma.project.update({
    where: { id: projectId },
    data: {
      collaborators: {
        disconnect: {
          id: getUser.id,
        },
      },
    },
  });

  return projectCollaborators;
};

export {
  createProject,
  queryProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  addCollaborator,
  deleteCollaborator,
};
