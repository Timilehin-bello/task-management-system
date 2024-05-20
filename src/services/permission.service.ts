import { BAD_REQUEST, NOT_FOUND } from "http-status";
import { Prisma } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { prisma } from ".";

/**
 * Checks if a permission with the given name is created, excluding a specific permission ID if provided.
 *
 * @param {string} name - The name of the permission to check.
 * @param {string} [excludePermissionId] - The ID of the permission to be excluded from the check.
 * @return {Promise<boolean>} Whether a permission with the given name exists, excluding the specified ID if provided.
 */
const isPermissionCreated = async (
  name: string,
  excludePermissionId?: string
): Promise<boolean> => {
  const permission = await prisma.permission.findFirst({
    where: {
      name: name,
      NOT: {
        id: excludePermissionId,
      },
    },
  });
  return !!permission;
};

const createPermission = async (
  userBody: Prisma.PermissionCreateInput
): Promise<ReturnType<typeof prisma.permission.create>> => {
  try {
    const { name, groupName } = userBody;

    if (await isPermissionCreated(name)) {
      throw new ApiError(BAD_REQUEST, "Permission already exists");
    }

    const permission = await prisma.permission.create({
      data: {
        name: name,
        groupName: groupName,
      },
      include: {
        role: true,
      },
    });

    return permission;
  } catch (error) {
    throw error;
  }
};

const queryPermission = async (filter: any, options: any): Promise<any> => {
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

  // Count total permissions matching the filter to calculate total pages
  const totalResults = await prisma.permission.count({
    where: filter,
  });

  const permissions = await prisma.permission.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
  });

  const totalPages = Math.ceil(totalResults / limit);

  const result = {
    permissions,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};

const getPermissionById = async (id: string) => {
  return prisma.permission.findUnique({ where: { id } });
};

const updatePermissionById = async (permissionId: string, updateBody: any) => {
  try {
    const permission = await getPermissionById(permissionId);
    if (!permission) {
      throw new ApiError(NOT_FOUND, "Permission not found");
    }

    return prisma.permission.update({
      where: { id: permissionId },
      data: updateBody,
    });
  } catch (error) {
    throw error;
  }
};

const deletePermissionById = async (permissionId: string): Promise<any> => {
  const permission = await getPermissionById(permissionId);
  if (!permission) {
    throw new ApiError(NOT_FOUND, "Permission not found");
  }
  await prisma.permission.delete({ where: { id: permissionId } });
  return permission;
};

export {
  createPermission,
  queryPermission,
  getPermissionById,
  updatePermissionById,
  deletePermissionById,
};
