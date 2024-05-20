import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import docsRoute from "./docs.route";
import projectRoute from "./project.route";
import taskRoute from "./task.route";
import roleRoute from "./role.route";
import permissionRoute from "./permission.route";
import { config } from "../../configs/config";

const router = express.Router();

interface Route {
  path: string;
  route: express.Router;
}

const defaultRoutes: Route[] = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/projects",
    route: projectRoute,
  },
  {
    path: "/tasks",
    route: taskRoute,
  },
  {
    path: "/role",
    route: roleRoute,
  },
  {
    path: "/permission",
    route: permissionRoute,
  },
];

const devRoutes: Route[] = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
