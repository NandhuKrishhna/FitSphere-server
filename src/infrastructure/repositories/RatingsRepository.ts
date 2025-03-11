import { Service } from "typedi";
import { IRatingRepository, IRatingRepositoryToken } from "../../application/repositories/IRatingsRepository";
import { RatingParams } from "../../domain/types/reviewsAndrating";
import RatingModel, { IRating } from "../models/RatingsModel";
import { IReview } from "../models/ReviewModel";
import { ObjectId } from "../models/UserModel";

@Service(IRatingRepositoryToken)
export class RatingsRepository implements IRatingRepository {
  async updateRating({ doctorId, averageRating, totalReviews }: RatingParams) {
    await RatingModel.findOneAndUpdate(
      { doctorId: doctorId },
      { averageRating, totalReviews },
      { upsert: true, new: true }
    );
  }

  async findRatingByDoctorId(doctorId: ObjectId): Promise<IRating | null> {
    return await RatingModel.findOne({ doctorId: doctorId });
  }
}
