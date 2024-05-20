import * as authService from "./auth.service";
import * as emailService from "./email.service";
import * as tokenService from "./token.service";
import * as userService from "./user.service";
import * as uploadService from "./upload.service";
import * as projectService from "./project.service";
import * as taskService from "./task.service";
import * as roleService from "./role.service";
import * as permissionService from "./permission.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export {
  emailService,
  tokenService,
  authService,
  userService,
  uploadService,
  projectService,
  taskService,
  roleService,
  permissionService,
  prisma,
};
