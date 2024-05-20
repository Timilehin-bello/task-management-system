import nodemailer from "nodemailer";
import { config } from "../configs/config";
import logger from "../configs/logger";
import pug from "pug";

const transport = nodemailer.createTransport(config.email.smtp);

const compiledResetPasswordFunction = pug.compileFile(
  "./src/views/resetPassword.pug"
);

/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise<void>}
 */
const sendEmail = async (
  to: string,
  subject: string,
  text: any
): Promise<void> => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise<void>}
 */
const sendResetPasswordEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const subject = "Reset password";
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://localhost:8888/reset-password?token=${token}`;
  const text = `Dear user,
This is your OTP: ${token} 
If you did not initiate this request, then ignore this email.`;
  // const text = compiledResetPasswordFunction({
  //   firstName: "John",
  //   url: resetPasswordUrl,
  // });

  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const subject = "Email Verification";
  // replace this url with the link to the email verification page of your front-end app
  // const verificationEmailUrl = `http://localhost:8888/verify-email?token=${token}`;
  const text = `Dear user,
This is your OTP: ${token} 
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

export { transport, sendEmail, sendResetPasswordEmail, sendVerificationEmail };
