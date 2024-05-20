import httpStatus from "http-status";
import { Request, Response } from "express";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { roleService } from "../services";

const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);

  res.status(httpStatus.CREATED).send({ status: "success", data: role });
});

const assignRoleToPermissions = catchAsync(
  async (req: Request, res: Response) => {
    const assignedRoleWithPermission = await roleService.roleAssignPermission(
      req.body.name,
      req.body.permissions
    );
    res
      .status(httpStatus.CREATED)
      .send({ status: "success", data: assignedRoleWithPermission });
  }
);

const getRoles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await roleService.queryRoles(filter, options);
  res.status(httpStatus.OK).send({ status: "success", data: result });
});

const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  }
  res.status(httpStatus.OK).send({ status: "success", data: role });
});

const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRoleById(req.params.roleId, req.body);
  res.status(httpStatus.OK).send({ status: "success", data: role });
});

const deleteRole = catchAsync(async (req, res) => {
  await roleService.deleteRoleById(req.params.roleId);
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "Role deleted successfully" });
});

export {
  createRole,
  assignRoleToPermissions,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
};
