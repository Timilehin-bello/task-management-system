import express, { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import { roleValidation } from "../../validations";
import { roleController } from "../../controllers";
const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("manageUsers"),
    validate(roleValidation.createRole),
    roleController.createRole
  )
  .get(
    auth("getUsers"),
    validate(roleValidation.getRoles),
    roleController.getRoles
  );

router
  .route("/role-assign-permission")
  .post(
    auth("manageUsers"),
    validate(roleValidation.assignRoleToPermissions),
    roleController.assignRoleToPermissions
  );

router
  .route("/:roleId")
  .get(
    auth("getUsers"),
    validate(roleValidation.getRole),
    roleController.getRole
  )
  .patch(
    auth("manageUsers"),

    validate(roleValidation.updateRole),
    roleController.updateRole
  )
  .delete(
    auth("manageUsers"),
    validate(roleValidation.deleteRole),
    roleController.deleteRole
  );

export default router;
