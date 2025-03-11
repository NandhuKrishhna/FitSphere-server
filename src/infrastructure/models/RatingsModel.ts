import mongoose, { Schema } from "mongoose";

export interface IRating extends Document {
  doctorId: mongoose.Types.ObjectId;
  averageRating: number;
  totalReviews: number;
}

const RatingSchema = new Schema<IRating>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, unique: true },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const RatingModel = mongoose.model<IRating>("Rating", RatingSchema);
export default RatingModel;
