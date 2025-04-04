import { Router } from "express";
import Container from "typedi";
import { CaloriesController } from "../../controllers/Feat/CaloriesControllle";

const caloriesRouter = Router();
const caloriesController = Container.get(CaloriesController);
caloriesRouter.post("/add-userdetails", caloriesController.addUserHealthDetails);
caloriesRouter.patch("/update-userdetails", caloriesController.updateUserDetails);
caloriesRouter.post("/add-foodlog", caloriesController.addMealHandler);
caloriesRouter.post("/delete-food", caloriesController.deleteFoodHandler);
caloriesRouter.post("/get-foodlog", caloriesController.getFoodLogsHandler);
caloriesRouter.get("/get-userHealthDetails", caloriesController.getUserHealthDetailsHandler);
caloriesRouter.get("/get-foods", caloriesController.searchFoodHandler);
caloriesRouter.patch("/edit-food", caloriesController.editFoodHandler);
caloriesRouter.get("/get-weight-progress", caloriesController.getWeightLogHandler);



export default caloriesRouter;
