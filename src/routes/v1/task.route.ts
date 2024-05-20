import express, { Router } from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import { productValidation } from "../../validations";
import { projectController } from "../../controllers";
import uploadUsingMulter from "../../configs/multer";
const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("manageProduct"),
    uploadUsingMulter.single("imageUrl"),
    validate(productValidation.createProduct),
    projectController.addProject
  )
  .get(validate(productValidation.getProducts), projectController.getProjects);

router
  .route("/:productId")
  .get(validate(productValidation.getProduct), projectController.getProject)
  .patch(
    auth("updateProduct"),
    uploadUsingMulter.single("imageUrl"),
    validate(productValidation.updateProduct),
    projectController.updateProject
  )
  .delete(
    auth("deleteProduct"),
    validate(productValidation.deleteProduct),
    projectController.deleteProject
  );

export default router;
