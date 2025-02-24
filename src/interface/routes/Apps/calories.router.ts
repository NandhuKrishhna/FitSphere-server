import { Router } from "express";
import Container from "typedi";
import { CaloriesController } from "../../controllers/Feat/CaloriesControllle";

const caloriesRouter = Router();
const caloriesController = Container.get(CaloriesController);
caloriesRouter.post("/serach-food", caloriesController.searchRecipeHandler);
caloriesRouter.post("/generate-recipe", caloriesController.getRecipeHandler);

export default caloriesRouter;
