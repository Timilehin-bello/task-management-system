import httpStatus from "http-status";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { userService } from "../services";

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send({ status: "success", data: user });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["firstName", "lastName", "role"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const users = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).send({ status: "success", data: users });
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.status(httpStatus.OK).send({ status: "success", data: user });
});

const updateUser = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.profileImage = `${req.file.destination}/${req.file.filename}`;
  }
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.status(httpStatus.OK).send({ status: "success", data: user });
});

const assignRolesToUser = catchAsync(async (req, res) => {
  const user = await userService.assignRolesToUser(req.body);
  // console.log("assignRolesToUser");
  res.status(httpStatus.OK).send({ status: "success", data: user });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "User deleted successfully" });
});

export {
  createUser,
  getUsers,
  assignRolesToUser,
  getUser,
  updateUser,
  deleteUser,
};
