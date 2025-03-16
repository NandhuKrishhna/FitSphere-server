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

  async findAllReviewsByDoctorId(doctorId: ObjectId ): Promise<IReview[]> {
    return await ReviewModel.aggregate([
      {
        $match: { doctorId },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          doctorId: 1,
          userId: 1,
          rating: 1,
          reviewText: 1,
          createdAt: 1,
          "userDetails._id": 1,
          "userDetails.name": 1,
          "userDetails.profilePicture": 1,
        },
      },
    ]);
  }

   async updateReview({ userId, doctorId, rating, reviewText ,reviewId}: ReviewsAndRatingParams): Promise<void> {
     await ReviewModel.updateOne({ userId, doctorId , _id:reviewId }, { rating, reviewText });
  }

  async deleteReview(doctorId: ObjectId, reviewId: ObjectId , userId : ObjectId): Promise<void> {
    await ReviewModel.deleteOne({ userId, doctorId, _id: reviewId });
  }
}
