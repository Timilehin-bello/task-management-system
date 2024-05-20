import httpStatus from "http-status";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { taskService } from "../services";
import { Request, Response } from "express";

const addTask = catchAsync(async (req: any, res: Response) => {
  const task = await taskService.createTask(
    req.body,
    req.body.taskId,
    req.user
  );
  res.status(httpStatus.CREATED).send({
    status: "success",
    data: task,
  });
});

const getTasks = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "name",
    "brand",
    "rating",
    "price",
    "size",
    "stockQuantity",
    "categoryName",
  ]);
  const options = pick(req.query, ["sortBy", "sequence", "limit", "page"]);
  const result = await taskService.queryTasks(filter, options);
  res.status(httpStatus.OK).send({
    status: "success",
    data: result,
  });
});

const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, {
    project: true,
  });
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "task not found");
  }
  res.status(httpStatus.OK).send({
    status: "success",
    data: task,
  });
});

const updatetask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.updateTaskById(req);
  res.status(httpStatus.OK).send({
    status: "success",
    data: task,
  });
});

const deletetask = catchAsync(async (req: any, res: Response) => {
  await taskService.deleteTaskById(req.user, req.params.taskId);
  res.status(httpStatus.OK).send({
    status: "success",
    message: "task deleted successfully",
  });
});

export { addTask, getTasks, getTask, updatetask, deletetask };
