import Joi from "joi";
import { objectId } from "./custom.validation";

const createPermission = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    groupName: Joi.string().required(),
  }),
};

const getPermissions = {
  query: Joi.object().keys({
    name: Joi.string(),
    groupName: Joi.string(),
    sortBy: Joi.string().valid("createdAt", "updatedAt"),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId),
  }),
};

const updatePermission = {
  params: Joi.object().keys({
    permissionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
    })
    .min(1),
};

const deletePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId),
  }),
};

export {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
};
