import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { Inject, Service } from "typedi";
import { CaloriesUseCase } from "../../../application/user-casers/CaloriesUserCase";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { userDetailsSchema } from "../../validations/user.details.schema";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import appAssert from "../../../shared/utils/appAssert";
import logger from "../../../shared/utils/logger";

@Service()
export class CaloriesController {
  constructor(@Inject() private caloriesUseCase: CaloriesUseCase) {}
  //spooner api
  searchRecipeHandler = catchErrors(async (req: Request, res: Response) => {
    const ingredients = req.body.ingredients;
    const response = await this.caloriesUseCase.searchFood(ingredients);
    res.status(OK).json({
      success: true,
      message: "Food Search Successfully",
      response,
    });
  });

  getRecipeHandler = catchErrors(async (req: Request, res: Response) => {
    const recipeId = req.body.recipeId;
    const resposse = await this.caloriesUseCase.getRecipeByIngredients(recipeId);
    res.status(OK).json({
      success: true,
      message: "Recipe Fetch Successfully",
      resposse,
    });
  });

  updateUserDetails = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const { userId } = req as AuthenticatedRequest;
    const data = userDetailsSchema.parse(req.body);
    const response = await this.caloriesUseCase.updateUserDetails(userId, data);
    res.status(OK).json({
      success: true,
      message: "User Details Updated Successfully",
      response,
    });
  });

  // get user health details
  getUserHealthDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const userHealthDetails = await this.caloriesUseCase.getUserHealthDetails(userId);
    res.status(OK).json({
      success: true,
      message: "User Health Details Fetched Successfully",
      userHealthDetails,
    });
  });

  // add foodlog
  addMealHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body);
    const { userId } = req as AuthenticatedRequest;
    const mealType = req.body.mealType;
    const foodItem = req.body.foodItem;
    // console.log("Food Item:", foodItem);
    // console.log("MealType:", mealType);
    const response = await this.caloriesUseCase.addMeal(userId, mealType, foodItem);
    res.status(CREATED).json({
      success: true,
      message: "Meal Added Successfully",
      response,
    });
  });

  getFoodLogsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const date = req.body.date;
    logger.info(req.body.date);
    const response = await this.caloriesUseCase.getFoodLogs(userId, date);
    res.status(OK).json({
      success: true,
      message: "Food Logs Fetched Successfully",
      response,
    });
  });

  //delete food
  deleteFoodHandler = catchErrors(async (req: Request, res: Response) => {
    const foodId = stringToObjectId(req.body.foodId);
    const date = req.body.date;
    console.log(req.body);
    const { userId } = req as AuthenticatedRequest;
    await this.caloriesUseCase.deleteFood(userId, foodId, date);
    res.status(OK).json({
      success: true,
      message: "Food Deleted Successfully",
    });
  });

  //* (USDA Food Database) user search food handler
  serachFoodHandler = catchErrors(async (req: Request, res: Response) => {
    const { query, quantity } = req.body;
    logger.info(req.body);
    const response = await this.caloriesUseCase.searchFoodForFoodLog(query, quantity);
    res.status(OK).json({
      success: true,
      message: "Food Searched Successfully",
      foodDetails: response,
    });
  });
}
