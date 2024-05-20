import { BAD_REQUEST, NOT_FOUND } from "http-status";
import { Prisma, PrismaClient, User } from "@prisma/client";
import ApiError from "../utils/ApiError";
import moment from "moment";
import bcrypt from "bcrypt";
import { uploads } from "../configs/cloudinary";
import { userService } from ".";

const prisma = new PrismaClient();

/**
 * Checks if an email is already taken.
 *
 * @param {string} email - The email to check.
 * @param {string} excludeUserId - (Optional) The ID of the user to exclude from the search.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating if the email is taken or not.
 */
const isEmailTaken = async (
  email: string,
  excludeUserId?: string
): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      NOT: {
        id: excludeUserId,
      },
    },
  });
  return !!user;
};

const createUser = async (userBody: Prisma.UserCreateInput) => {
  try {
    const { password, email, ...rest } = userBody;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the role "USER" exists in the database
    let existingRole = await prisma.role.findUnique({
      where: { name: "USER" },
    });
    if (!existingRole) {
      // If the role doesn't exist, create it dynamically
      existingRole = await prisma.role.create({
        data: {
          name: "USER",
        },
      });
    }

    // Proceed with user creation and connection to the existing or newly created role
    return await prisma.user.create({
      data: {
        ...rest,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: {
          connect: {
            name: "USER",
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Queries users based on the provided filter and options.
 *
 * @param {any} filter - The filter to apply to the query.
 * @param {any} options - The options to customize the query.
 * @param {string} options.sortBy - The field to sort the results by.
 * @param {number} options.limit - The maximum number of results to return.
 * @param {number} options.page - The page number of results to return.
 * @return {Promise<any[]>} The array of users that match the query criteria.
 */
const queryUsers = async (filter: any, options: any) => {
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

  // Count total users matching the filter to calculate total pages
  const totalResults = await prisma.user.count({
    where: filter,
  });

  const users = await prisma.user.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
  });

  const totalPages = Math.ceil(totalResults / limit);

  const result = {
    users,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};

const assignRolesToUser = async (roleBody: any) => {
  try {
    const { userId, roles } = roleBody;

    const getUser = await userService.getUserByEmail(
      { id: userId },
      {
        role: {
          select: {
            name: true,
          },
        },
      }
    );

    // console.log("getUser role", getUser.role);
    // console.log("roles", roles);

    if (!getUser) {
      throw new Error("User not found");
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: {
          connect: roles,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a user by their ID.
 *
 * @param {string} id - The ID of the user to retrieve.
 * @return {Promise<User | null>} A promise that resolves to the user with the specified ID, or null if no user is found.
 */
const getUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

/**
 * Retrieves a user by their email address.
 *
 * @param {Prisma.UserWhereUniqueInput} where - The unique identifier for the user.
 * @param {Prisma.UserSelect} [select] - Optional fields to select from the user object.
 * @returns {Promise<User | null>} A promise that resolves to the user object if found, or null if not found.
 */
const getUserByEmail = async (
  where: Prisma.UserWhereUniqueInput,
  include?: Prisma.UserInclude
): Promise<any | null> => {
  return prisma.user.findUnique({ where, include });
};

/**
 * Updates the last login timestamp for a user.
 *
 * @param {string} userId - The ID of the user.
 * @return {Promise<any>} - A promise that resolves to the updated user object.
 */
const updateLastLogin = async (userId: string): Promise<any> => {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLogin: moment().toISOString() },
  });
};

/**
 * Updates a user by their ID.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {any} updateBody - The data to update the user with.
 * @return {Promise<any>} - A promise that resolves to the updated user.
 */
const updateUserById = async (
  userId: string,
  updateBody: any
): Promise<any> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(NOT_FOUND, "User not found");
    }
    const { password, profileImage } = updateBody;
    if (profileImage) {
      updateBody.profileImage = (await uploads(profileImage)).url;
    }
    if (password) {
      updateBody.password = await bcrypt.hash(password, 8);
    }

    if (updateBody.email && (await isEmailTaken(updateBody.email, userId))) {
      throw new ApiError(BAD_REQUEST, "Email already taken");
    }

    return prisma.user.update({ where: { id: userId }, data: updateBody });
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a user by their ID.
 *
 * @param {string} userId - The ID of the user to delete.
 * @return {Promise<User>} The deleted user.
 */
const deleteUserById = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(NOT_FOUND, "User not found");
  }
  await prisma.user.delete({ where: { id: userId } });
  return user;
};

export {
  createUser,
  queryUsers,
  getUserById,
  assignRolesToUser,
  getUserByEmail,
  updateLastLogin,
  updateUserById,
  deleteUserById,
  isEmailTaken,
};
