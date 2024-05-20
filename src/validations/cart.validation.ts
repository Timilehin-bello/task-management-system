import Joi from "joi";
import { objectId } from "./custom.validation";

const addToCart = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    quantity: Joi.string().required(),
    operation: Joi.string().valid("increase", "decrease").required(),
  }),
};

const removeFromCart = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
};

const clearCart = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
};

export { addToCart, removeFromCart, clearCart };
