import Joi from "joi";
import "dotenv/config";

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("development", "production", "local")
      .required(),
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().default("localhost"),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    OTP_EXPIRATION_SECONDS: Joi.number()
      .default(300)
      .description("seconds after which otp expires"),

    LOG_FOLDER: Joi.string().required(),
    LOG_FILE: Joi.string().required(),
    LOG_LEVEL: Joi.string().required(),
    REDIS_PROTOCOL: Joi.string().default("redis"),
    REDIS_USERNAME: Joi.string().default("default"),
    REDIS_HOST: Joi.string().default("127.0.0.1"),
    REDIS_PORT: Joi.number().default(6379),

    REDIS_USER_PASSWORD: Joi.string().default("no"),
    REDIS_PASSWORD: Joi.string(),

    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
    CLOUDINARY_USER_NAME: Joi.string().description("user name for cloudinary"),
    CLOUDINARY_API_KEY: Joi.string().description("api key for cloudinary"),
    CLOUDINARY_API_SECRET: Joi.string().description(
      "api secret for cloudinary"
    ),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  dbHost: envVars.DB_HOST,
  dbUser: envVars.DB_USER,
  dbPass: envVars.DB_PASSWORD,
  dbName: envVars.DB_NAME,
  dbPort: envVars.DB_PORT,
  dbUrl: envVars.DATABASE_URL,

  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    otpExpirationSeconds: envVars.OTP_EXPIRATION_SECONDS,
  },
  logConfig: {
    logFolder: envVars.LOG_FOLDER,
    logFile: envVars.LOG_FILE,
    logLevel: envVars.LOG_LEVEL,
  },

  redis: {
    protocol: envVars.REDIS_PROTOCOL,
    username: envVars.REDIS_USERNAME,
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    userPassword: envVars.REDIS_USER_PASSWORD,
    password: envVars.REDIS_PASSWORD,
  },

  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },

  cloudinary: {
    cloudName: envVars.CLOUDINARY_USER_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
};
