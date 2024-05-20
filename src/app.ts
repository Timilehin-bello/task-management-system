import express, { Express, Request, Response } from "express";
import helmet from "helmet";
// import xss from "xss-clean";
import compression from "compression";
import cors from "cors";
import passport from "passport";
import httpStatus from "http-status";
import { config } from "./configs/config";
import morgan from "./configs/morgan";
import { jwtStrategy } from "./configs/passport";
import { authLimiter } from "./middlewares/rateLimiter";
import routes from "./routes/v1";
import { errorConverter, errorHandler } from "./middlewares/error";
import ApiError from "./utils/ApiError";
import logger from "./configs/logger";

export const app: Express = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to swyke API🚀🚀🚀",
  });
});

// v1 api routes
app.use("/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// redisClient.on("error", (err) => {
//   console.log(err);
//   logger.error("redis error", err);
//   redisClient.quit();
// });
// redisClient.connect();
