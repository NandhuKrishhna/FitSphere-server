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

  async fetchReviewsAndRating(doctorId: ObjectId): Promise<any> {
    return await ReviewModel.aggregate([
      {
        $match: {
          doctorId: doctorId,
        },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "ratingDetails",
        },
      },
      {
        $unwind: {
          path: "$ratingDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          doctorId: 1,
          rating: 1,
          reviewText: 1,
          createdAt: 1,
          averageRating: "$ratingDetails.averageRating",
          totalReviews: "$ratingDetails.totalReviews",
        },
      },
    ]);
  }
  async findAllReviewsByDoctorId(doctorId: ObjectId): Promise<IReview[]> {
    return await ReviewModel.find({ doctorId: doctorId });
  }
}
