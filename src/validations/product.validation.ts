import Joi from "joi";
import { objectId } from "./custom.validation";

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    brand: Joi.string().required(),
    price: Joi.number().required(),
    // imageUrl: Joi.binary().required(),
    size: Joi.number(),
    stockQuantity: Joi.number().required(),
    categoryName: Joi.string().required(),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    brand: Joi.string(),
    price: Joi.string(),
    size: Joi.number(),
    categoryName: Joi.string(),
    stockQuantity: Joi.number(),
    rating: Joi.number(),
    numReviews: Joi.number(),
    sortBy: Joi.string(),
    sequence: Joi.string().valid("asc", "desc"),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      imageUrl: Joi.string(),
      description: Joi.string(),
      brand: Joi.string(),
      price: Joi.number(),
      size: Joi.number(),
      stockQuantity: Joi.number(),
      categoryName: Joi.string(),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const createProductReview = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().required(),
  }),
};

export {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
