import httpStatus from "http-status";
import { TokenType, User, } from "@prisma/client";
import * as tokenService from "./token.service";
import * as userService from "./user.service";
import ApiError from "../utils/ApiError";
import bcrypt from "bcrypt";
import { redisService, prisma } from ".";

/**
 * Login with username and password
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<any> => {
  const isEmailTaken = await userService.isEmailTaken(email);

  if (!isEmailTaken) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User not found with this email, please register"
    );
  }

  const user: any = await userService.getUserByEmail(
    { email },
    {
      role: true,
    }
  );

  if (!user.isEmailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please verify your email");
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  await userService.updateLastLogin(user.id);

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */

const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenDoc = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false,
    },
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
  await redisService.removeToken(refreshToken, "refresh_token");
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken: string): Promise<Object> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      TokenType.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
): Promise<void> => {
  // TODO: Need to create a logic that restrict a User from using formal password as new password
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      TokenType.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new Error("User not found");
    }
    await userService.updateUserById(user.id, {
      password: newPassword,
    });
    await prisma.token.deleteMany({
      where: { userId: user.id, type: TokenType.RESET_PASSWORD },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

/**
 * Verify email
 *
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken: string): Promise<void> => {
  // console.log(verifyEmailToken);
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      TokenType.VERIFY_EMAIL
    );

    // console.log("verifyEmailTokenDoc", verifyEmailTokenDoc);
    const user = await userService.getUserById(verifyEmailTokenDoc.userId);
    if (!user) {
      throw new Error("User not found");
    }
    await prisma.token.deleteMany({
      where: { userId: user.id, type: TokenType.VERIFY_EMAIL },
    });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

export {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
