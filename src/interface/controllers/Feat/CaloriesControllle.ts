import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { Inject, Service } from "typedi";
import { CaloriesUseCase } from "../../../application/user-casers/CaloriesUserCase";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { userDetailsSchema } from "../../validations/user.details.schema";
import { IUserDetails } from "../../../infrastructure/models/user.addition.details";

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
    const { userId } = req as AuthenticatedRequest;
    const data = userDetailsSchema.parse(req.body);
    const response = await this.caloriesUseCase.updateUserDetails(userId, data);
    res.status(OK).json({
      success: true,
      message: "User Details Updated Successfully",
      response,
    });
  });

  addMealHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { mealType, foodItems } = req.body;
    const response = await this.caloriesUseCase.addMeal(userId, mealType, foodItems);
    res.status(CREATED).json({
      success: true,
      message: "Meal Added Successfully",
      response,
    });
  });
}
