import { Token } from "typedi";
import { RatingParams } from "../../domain/types/reviewsAndrating";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { IRating } from "../../infrastructure/models/RatingsModel";

export interface IRatingRepository {
  updateRating({ doctorId, averageRating, totalReviews }: RatingParams): Promise<void>;
  findRatingByDoctorId(doctorId: ObjectId): Promise<IRating | null>;
  findAllRatings(): Promise<IRating[]>;
}

export const IRatingRepositoryToken = new Token<IRatingRepository>();
