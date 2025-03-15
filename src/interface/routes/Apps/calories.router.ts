import { Router } from "express";
import Container from "typedi";
import { CaloriesController } from "../../controllers/Feat/CaloriesControllle";

const caloriesRouter = Router();
const caloriesController = Container.get(CaloriesController);
caloriesRouter.post("/serach-food", caloriesController.searchRecipeHandler);
caloriesRouter.post("/generate-recipe", caloriesController.getRecipeHandler);
caloriesRouter.post("/update-userdetails", caloriesController.updateUserDetails);
caloriesRouter.post("/add-foodlog", caloriesController.addMealHandler);
caloriesRouter.post("/delete-food", caloriesController.deleteFoodHandler);
caloriesRouter.post("/get-foodlog", caloriesController.getFoodLogsHandler);
caloriesRouter.get("/get-userHealthDetails", caloriesController.getUserHealthDetailsHandler);
caloriesRouter.get("/get-foods", caloriesController.searchFoodHandler);
caloriesRouter.patch("/edit-foods", caloriesController.editFoodHandler);


export default caloriesRouter;
