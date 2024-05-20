import { BAD_REQUEST, NOT_FOUND } from "http-status";
import { Prisma } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { prisma } from ".";

/**
 * Checks if a role with the given name exists, excluding a specific role ID if provided.
 *
 * @param {string} name - the name of the role to check
 * @param {string} [excludeRoleId] - the ID of the role to exclude from the check
 * @return {Promise<boolean>} true if the role exists, false otherwise
 */
const isRoleCreated = async (
  name: string,
  excludeRoleId?: string
): Promise<boolean> => {
  const role = await prisma.role.findFirst({
    where: {
      name: name.toUpperCase(),
      NOT: {
        id: excludeRoleId,
      },
    },
  });
  return !!role;
};

/**
 * Asynchronously creates a role using the provided userBody.
 *
 * @param {Prisma.RoleCreateInput} userBody - the input for creating the role
 * @return {Promise<ReturnType<typeof prisma.role.create>>} a Promise resolving to the created role with included permissions
 */
const createRole = async (
  userBody: Prisma.RoleCreateInput
): Promise<ReturnType<typeof prisma.role.create>> => {
  try {
    const { name, permissions }: any = userBody;

    // Check if the role is already created
    if (await isRoleCreated(name)) {
      throw new ApiError(BAD_REQUEST, "Role already exists");
    }

    // Create the role with the provided data
    const role = await prisma.role.create({
      data: {
        name: name.toUpperCase(),
        permission: {
          connect:
            permissions.map((permission: any) => ({
              id: permission.id,
            })) || [],
        },
      },
      include: {
        permission: true,
      },
    });

    return role;
  } catch (error) {
    throw error;
  }
};

/**
 * Assigns permissions to a role
 * @param name - The name of the role
 * @param permissions - The permissions to be assigned to the role
 * @returns The role with the assigned permissions
 */
const roleAssignPermission = async (name: string, permissions: any) => {
  try {
    // Upsert the role with the specified name and connect the permissions
    const upsertRoleWithPermissions = await prisma.role.upsert({
      where: { name: name.toUpperCase() },
      update: {
        permission: {
          connect:
            permissions.map((permission: any) => ({
              id: permission.id,
            })) || [],
        },
      },
      create: {
        name: name,
        permission: {
          connect:
            permissions.map((permission: any) => ({
              id: permission.id,
            })) || [],
        },
      },
      include: {
        permission: true,
      },
    });

    return upsertRoleWithPermissions;
  } catch (error) {
    throw error;
  }
};
/**
 * Asynchronously queries roles based on the provided filter and options.
 *
 * @param {any} filter - the filter criteria for role querying
 * @param {any} options - additional options for role querying
 * @return {Promise<any>} a promise that resolves to an array of roles
 */

const queryRoles = async (filter: any, options: any): Promise<any> => {
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

  // Count total roles matching the filter to calculate total pages
  const totalResults = await prisma.role.count({
    where: filter,
  });

  const roles = await prisma.role.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
    include: {
      permission: true,
    },
  });

  const totalPages = Math.ceil(totalResults / limit);

  const result = {
    roles,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};

/**
 * Retrieves a role by its ID.
 *
 * @param {string} id - The ID of the role to retrieve.
 * @return {Promise<Role>} A promise that resolves to the role object.
 */
const getRoleById = async (id: string) => {
  return prisma.role.findUnique({ where: { id } });
};

/**
 * Updates a role by its ID.
 *
 * @param {string} roleId - The ID of the role to update
 * @param {any} updateBody - The updated role data
 * @return {Promise<any>} The updated role
 */
const updateRoleById = async (
  roleId: string,
  updateBody: any
): Promise<any> => {
  try {
    const role = await getRoleById(roleId);
    if (!role) {
      throw new ApiError(NOT_FOUND, "Role not found");
    }

    const { name, ...rest } = updateBody;
    return prisma.role.update({
      where: { id: roleId },
      data: { ...rest, name: name.toUpperCase() },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a role by its ID.
 *
 * @param {string} roleId - The ID of the role to be deleted
 * @return {Promise<any>} The deleted role
 */
const deleteRoleById = async (roleId: string): Promise<any> => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(NOT_FOUND, "Role not found");
  }
  await prisma.role.delete({ where: { id: roleId } });
  return role;
};

export {
  createRole,
  roleAssignPermission,
  queryRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
};
