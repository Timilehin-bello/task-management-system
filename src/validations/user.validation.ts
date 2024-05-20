import Joi from "joi";
import { password, objectId } from "./custom.validation";

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    phoneNumber: Joi.string().required(),
    role: Joi.string().required().valid("USER", "SUPER_ADMIN", "ADMIN"),
  }),
};
const assignRolesToUser = {
  body: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    roles: Joi.array().required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string().valid("USER", "SUPER_ADMIN", "ADMIN"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      firstName: Joi.string(),
      lastName: Joi.string(),
      profileImage: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export {
  createUser,
  assignRolesToUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
