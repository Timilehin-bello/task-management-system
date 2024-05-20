import express, { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import { permissionValidation } from "../../validations";
import { permissionController } from "../../controllers";
const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("manageUsers"),
    validate(permissionValidation.createPermission),
    permissionController.createPermission
  )
  .get(
    auth("getUsers"),
    validate(permissionValidation.getPermissions),
    permissionController.getPermissions
  );

router
  .route("/:permissionId")
  .get(
    auth("getUsers"),
    validate(permissionValidation.getPermission),
    permissionController.getPermission
  )
  .patch(
    auth("manageUsers"),

    validate(permissionValidation.updatePermission),
    permissionController.updatePermission
  )
  .delete(
    auth("manageUsers"),
    validate(permissionValidation.deletePermission),
    permissionController.deletePermission
  );

export default router;
