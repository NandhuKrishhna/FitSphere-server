import { Token } from "typedi";
import { ReviewsAndRatingParams } from "../../domain/types/reviewsAndrating";
import { IReview } from "../../infrastructure/models/ReviewModel";
import { ObjectId } from "../../infrastructure/models/UserModel";

export interface IReviewsRepository {
  createReview({ userId, doctorId, rating, reviewText }: ReviewsAndRatingParams): Promise<IReview>;
  findAllReviewsByDoctorId(doctorId: ObjectId): Promise<IReview[]>;
  updateReview({ userId, doctorId, rating, reviewText , reviewId }: ReviewsAndRatingParams): Promise<void>;
  deleteReview(doctorId: ObjectId, reviewId: ObjectId , userId : ObjectId): Promise<void>;
}

export const IReviewsRepositoryToken = new Token<IReviewsRepository>();
