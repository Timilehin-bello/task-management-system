import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
// import * as OTPAuth from "otpauth";

import {
  authService,
  userService,
  tokenService,
  emailService,
} from "../services";
import ApiError from "../utils/ApiError";

/**
 * Registers a new user.
 *
 * @route POST /v1/auth/register
 * @access Public
 * @param req - The request object containing the user data.
 * @param res - The response object to send the user and tokens.
 */
const register = catchAsync(async (req: Request, res: Response) => {
  // Create a new user using the user service

  const user = await userService.createUser(req.body);

  // Generate authentication tokens for the user
  // const tokens = await tokenService.generateAuthTokens(user);

  // Set the status code to 201 (Created) and send the user and tokens as the response
  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "User created successfully",
    data: {
      user,
      //  tokens
    },
  });
});

/**
 * Handle user login
 *
 * @route POST /v1/auth/login
 * @access Public
 * @param req - The request object
 * @param res - The response object
 */
const login = catchAsync(async (req: Request, res: Response) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Login user with the provided email and password
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  // Generate authentication tokens for the logged in user
  const tokens = await tokenService.generateAuthTokens(user);

  // Prepare user response data
  const userRes = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,

    role: user.role, // TODO: Add role to user response
  };

  // Send user response and tokens to the client
  res.send({
    status: "success",
    message: "User logged in successfully",
    data: { user: userRes, tokens },
  });
});

/**
 * Logout handler
 *
 * @route POST /v1/auth/logout
 * @access Public
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
const logout = catchAsync(async (req: Request, res: Response) => {
  // Call the logout function from the authService
  await authService.logout(req.body.refreshToken);
  // Send a "No Content" response
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "User logged out successfully" });
});

/**
 * Refreshes authentication tokens.
 *
 * @route POST /v1/auth/refresh
 * @access Public
 * @param req The request object.
 * @param res The response object.
 */
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  // Call the `refreshAuth` function from the `authService` module
  const tokens = await authService.refreshAuth(req.body.refreshToken);

  // Send the tokens in the response
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "Tokens refreshed", data: tokens });
});

/**
 * Handles the forgot password functionality.
 *
 * @route POST /v1/auth/forgot-password
 * @access Public
 * @param req - The request object.
 * @param res - The response object.
 */
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  // Generate reset password token
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );

  // Send reset password email
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);

  // Send success response
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Password reset email sent successfully",
  });
});

/**
 * Resets the user's password.
 *
 * @route POST /v1/auth/reset-password
 * @access Public
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // Reset the user's password using the token and new password.
  await authService.resetPassword(req.query.token as string, req.body.password);

  // Send a 204 No Content response.
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "Password reset successfully" });
});

/**
 * Sends a verification email to the user.
 *
 * @route /v1/auth/send-verification-email
 * @access Private
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the email is sent.
 */
const sendVerificationEmail = catchAsync(async (req: any, res: Response) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail({ email });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found with this email, please register"
    );
  }

  if (user.isEmailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
  }

  // Generate a verification email token
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);

  // Send the verification email
  await emailService.sendVerificationEmail(email, verifyEmailToken);

  // Send a success response
  res.status(httpStatus.OK).send({ status: "success", message: "Email sent" });
});

/**
 * Verifies the user's email address.
 *
 * @route /v1/auth/verify-email
 * @access Nill
 * @param req - The request object containing the token.
 * @param res - The response object.
 */
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  // Call the verifyEmail function from the authService.
  await authService.verifyEmail(req.query.token as string);

  // Send a successful response with no content.
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Email verified successfully",
  });
});

const generateOTP = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;

  const user = await userService.getUserById(userId);

  const otpTokens = await tokenService.generateOTPAuth(user);
  // console.log("otpTokens", otpTokens);

  res.status(httpStatus.OK).send({ status: "success", data: otpTokens });
});

const VerifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  const user = await userService.getUserById(userId);

  const updatedUser = await tokenService.verifyOTPAuth(user, token);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "OTP verified successfully",
    data: {
      otp_verified: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        otpEnabled: updatedUser.otp_enabled,
      },
    },
  });
});

const verifyUserOTP = catchAsync(async (req: Request, res: Response) => {
  const { type, token } = req.body;

  const verified = await tokenService.verifyToken(token, type);
  res.status(httpStatus.OK).send({
    status: "success",
    message: "OTP verified successfully",
    data: verified,
  });
});

export {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  generateOTP,
  VerifyOTP,
  verifyUserOTP,
};
