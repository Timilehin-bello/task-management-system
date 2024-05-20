import httpStatus from "http-status";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { permissionService } from "../services";

const createPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);

  res.status(httpStatus.CREATED).send({ status: "success", data: permission });
});

const getPermissions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "groupName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await permissionService.queryPermission(filter, options);
  res.status(httpStatus.OK).send({ status: "success", data: result });
});

const getPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.getPermissionById(
    req.params.permissionId
  );
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, "Permission not found");
  }
  res.status(httpStatus.OK).send({ status: "success", data: permission });
});

const updatePermission = catchAsync(async (req, res) => {
  const permission = await permissionService.updatePermissionById(
    req.params.permissionId,
    req.body
  );
  res.status(httpStatus.OK).send({ status: "success", data: permission });
});

const deletePermission = catchAsync(async (req, res) => {
  await permissionService.deletePermissionById(req.params.permissionId);
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "Permission deleted successfully" });
});

export {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
};
