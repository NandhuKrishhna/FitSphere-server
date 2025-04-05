import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import { Inject, Service } from "typedi";
import { CaloriesUseCase } from "../../../application/user-casers/CaloriesUserCase";
import { BAD_REQUEST, CREATED, OK } from "../../../shared/constants/http";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { updateUserDetailsSchema, userDetailsSchema } from "../../validations/user.details.schema";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import appAssert from "../../../shared/utils/appAssert";
import { ICaloriesUseCaseToken } from "../../../application/user-casers/interface/ICaloriesUseCase";

@Service()
export class CaloriesController {
  constructor(@Inject() private _caloriesUseCase: CaloriesUseCase) { }

  addUserHealthDetails = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const data = userDetailsSchema.parse(req.body);
    const response = await this._caloriesUseCase.addUserHealthDetails(userId, data);
    res.status(OK).json({
      success: true,
      message: "User Health Details Added Successfully",
      response,
    });
  })
  updateUserDetails = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const data = updateUserDetailsSchema.parse(req.body);
    const response = await this._caloriesUseCase.updateUserDetails(userId, data);
    res.status(OK).json({
      success: true,
      message: "User Details Updated Successfully",
      response,
    });
  });

  // get user health details
  getUserHealthDetailsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const userHealthDetails = await this._caloriesUseCase.getUserHealthDetails(userId);
    res.status(OK).json({
      success: true,
      message: "User Health Details Fetched Successfully",
      userHealthDetails,
    });
  });

  // add foodlog
  addMealHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    console.log(req.body);
    const { mealType, foodItem, date } = req.body
    const response = await this._caloriesUseCase.addMeal(userId, mealType, foodItem, date);
    res.status(CREATED).json({
      success: true,
      message: "Meal Added Successfully",
      response,
    });
  });

  getFoodLogsHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const date = req.body.date;
    const response = await this._caloriesUseCase.getFoodLogs(userId, date);
    res.status(OK).json({
      success: true,
      message: "Food Logs Fetched Successfully",
      response,
    });
  });

  //delete food
  deleteFoodHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body)
    const { foodId, date, mealType } = req.body
    const { userId } = req as AuthenticatedRequest;
    await this._caloriesUseCase.deleteFood(userId, foodId, date, mealType);
    res.status(OK).json({
      success: true,
      message: "Food Deleted Successfully",
    });
  });

  //* (USDA Food Database) user search food handler
  searchFoodHandler = catchErrors(async (req: Request, res: Response) => {
    const { query, quantity } = req.query;
    const response = await this._caloriesUseCase.searchFoodForFoodLog(query as string, quantity ? Number(quantity) : undefined);
    res.status(OK).json({
      success: true,
      message: "Food Searched Successfully",
      foodDetails: response,
    });
  });

  //edit food 
  editFoodHandler = catchErrors(async (req: Request, res: Response) => {
    console.log(req.body)
    const foodId = stringToObjectId(req.body.foodId);
    const { date, mealType, foodItem: updatedFoodItem } = req.body
    const { userId } = req as AuthenticatedRequest;
    const response = await this._caloriesUseCase.editFood(userId, foodId, date, updatedFoodItem, mealType);
    res.status(OK).json({
      success: true,
      message: "Food Updated Successfully",
      foodId: response
    });
  })

  //*Get Weight Logs;
  getWeightLogHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    appAssert(userId, BAD_REQUEST, "Invalid User ID. Please login again.");
    const weightProgress = await this._caloriesUseCase.getWeightLogs(userId);
    res.status(OK).json({
      success: true,
      message: "Weight Log fetch successfully",
      weightProgress
    })
  })

}
