import { Service } from "typedi";
import { IReviewsRepository, IReviewsRepositoryToken } from "../../application/repositories/IReviewsRepository";
import { ReviewsAndRatingParams } from "../../domain/types/reviewsAndrating";
import ReviewModel, { IReview } from "../models/ReviewModel";
import { ObjectId } from "../models/UserModel";

@Service(IReviewsRepositoryToken)
export class ReviewsRepository implements IReviewsRepository {
  async createReview({ userId, doctorId, rating, reviewText }: ReviewsAndRatingParams): Promise<IReview> {
    return await ReviewModel.create({ userId, doctorId, rating, reviewText });
  }

  async findAllReviewsByDoctorId(doctorId: ObjectId): Promise<IReview[]> {
    return await ReviewModel.find({ doctorId: doctorId });
  }
}
