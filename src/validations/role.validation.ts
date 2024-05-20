import Joi from "joi";
import { objectId } from "./custom.validation";

const createRole = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    permissions: Joi.array().required(),
  }),
};
const assignRoleToPermissions = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    permissions: Joi.array().required(),
  }),
};

const getRoles = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const updateRole = {
  params: Joi.object().keys({
    roleId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
    })
    .min(1),
};

const deleteRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

export {
  createRole,
  assignRoleToPermissions,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
};
