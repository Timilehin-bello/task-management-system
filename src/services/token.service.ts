import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import * as OTPAuth from "otpauth";
import otpGenerator from "otp-generator";
import { encode } from "hi-base32";
import moment from "moment";
import { TokenType, Prisma, Token } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { config } from "../configs/config";
import { tokenTypes } from "../configs/tokens";
import httpStatus from "http-status";
import { dateTime } from "../utils/dateTime";
import { prisma, userService } from ".";

/**
 * Generates a token for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {moment.Moment} expires - The expiration date and time of the token.
 * @param {string} type - The type of token.
 * @param {string} [secret=config.jwt.secret] - The secret key used to sign the token. Defaults to the value from the config.
 * @return {string} The generated token.
 */
const generateToken = (
  userId: string,
  expires: moment.Moment,
  type: string,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  // console.log("payload", payload);
  return jwt.sign(payload, secret);
};

const generateOTP = () => {
  return otpGenerator.generate(8, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

/**
 * Saves a token to the database.
 *
 * @param {Prisma.TokenCreateManyInput} input - The token data to be saved.
 * @return {Promise<Token>} The saved token.
 */
const saveToken = async (
  input: Prisma.TokenCreateManyInput
): Promise<Token> => {
  return await prisma.token.create({
    data: input,
  });
};

/**
 * Verifies the authenticity and validity of a token.
 *
 * @param {string} token - The token to be verified.
 * @param {TokenType} type - The type of token to be verified.
 * @return {Promise<Token>} The verified token document.
 */
const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  let payload: any = false;
  if (type === TokenType.REFRESH) {
    payload = jwt.verify(token, config.jwt.secret);
  }

  const tokenDoc = await prisma.token.findFirst({
    where: {
      token,
      ...(payload.sub && { userId: payload.sub }),
      type,
      blacklisted: false,
      expires: {
        gt: dateTime(),
      },
    },
  });

  if (!tokenDoc) {
    throw new Error("Token not found or expired");
  }

  return tokenDoc;
};
/**
 * Verify the OTP token.
 *
 * @param {string} token - The OTP token to be verified
 * @param {TokenType} type - The type of the token
 * @return {Promise<Token>} The verified token
 */
// const verifyOTPToken = async (
//   token: string,
//   type: TokenType
// ): Promise<Token> => {
//   console.log("token", token);
//   const tokenDoc = await prisma.token.findFirst({
//     where: {
//       token,
//       type,
//       blacklisted: false,
//     },
//   });

//   console.log("tokenDoc", tokenDoc);

//   if (!tokenDoc) {
//     throw new Error("Token not found");
//   }

//   return tokenDoc;
// };

/**
 * Generates authentication tokens for a user.
 *
 * @param {any} user - The user object.
 * @return {Promise} An object containing access and refresh tokens with their expiration dates.
 */
const generateAuthTokens = async (
  user: any
): Promise<{
  access: { token: string; expires: Date };
  refresh: { token: string; expires: Date };
}> => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    user,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  await saveToken({
    token: refreshToken,
    type: TokenType.REFRESH,
    userId: user.id,
    expires: refreshTokenExpires.toDate(),
  });

  const tokens = {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };

  return tokens;
};

/**
 * Generates a reset password token for a given email.
 *
 * @param {string} email - The email of the user.
 * @return {Promise<string>} - The generated reset password token.
 */
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }

  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  const resetPasswordOTPToken = generateOTP();

  await saveToken({
    token: resetPasswordOTPToken,
    type: TokenType.RESET_PASSWORD,
    userId: user.id,
    expires: expires.toDate(),
  });
  return resetPasswordOTPToken;
};

/**
 * Generates a verify email token for the given user.
 *
 * @param {any} user - The user object for which to generate the verify email token.
 * @return {Promise<string>} - The generated verify email token.
 */
const generateVerifyEmailToken = async (user: any): Promise<string> => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );
  const verifyEmailToken = generateToken(
    user.id,
    expires,
    tokenTypes.VERIFY_EMAIL
  );

  const verifyEmailOTPToken = generateOTP();

  await saveToken({
    token: verifyEmailOTPToken,
    userId: user.id,
    expires: moment().add(5, "minutes").toDate(),
    type: TokenType.VERIFY_EMAIL,
  });
  return verifyEmailOTPToken;
};

/**
 * Generates a random base32 string.
 *
 * @return {string} A randomly generated base32 string.
 */
const generateRandomBase32 = (): string => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

export {
  generateToken,
  saveToken,
  verifyToken,
  // verifyOTPToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateRandomBase32,
};
