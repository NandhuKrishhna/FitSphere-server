import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { Inject, Service } from "typedi";
import { CaloriesUseCase } from "../../../application/user-casers/CaloriesUserCase";
import { BAD_REQUEST, OK } from "../../../shared/constants/http";
import appAssert from "../../../shared/utils/appAssert";

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
}
