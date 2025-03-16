import { ObjectId } from "../../infrastructure/models/UserModel";

export type ReviewsAndRatingParams = {
  doctorId: ObjectId;
  rating: number;
  reviewText: string;
  userId: ObjectId;
  reviewId?: ObjectId
};

export type RatingParams = {
  doctorId: ObjectId;
  averageRating: number;
  totalReviews: number;
};
