import Joi from "joi";
import { objectId } from "./custom.validation";

const createAddress = {
  body: Joi.object().keys({
    street: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
  }),
};

const getAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId),
  }),
};

const updateAddress = {
  params: Joi.object().keys({
    addressId: Joi.required().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      street: Joi.string(),
      city: Joi.string(),
      postalCode: Joi.string(),
      state: Joi.string(),
      country: Joi.number(),
    })
    .min(1),
};

const deleteAddress = {
  params: Joi.object().keys({
    addressId: Joi.string().custom(objectId).required(),
  }),
};

export { createAddress, getAddress, updateAddress, deleteAddress };
