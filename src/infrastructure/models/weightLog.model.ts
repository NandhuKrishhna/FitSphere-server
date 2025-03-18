import mongoose, { Schema, Document } from "mongoose";

export interface IWeightLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  weight: number;
}

const WeightLogSchema = new Schema<IWeightLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, default: () => new Date().setUTCHours(0, 0, 0, 0) },
    weight: { type: Number, required: true },
  },
  { timestamps: true }
);

WeightLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WeightLogModel = mongoose.model<IWeightLog>("WeightLog", WeightLogSchema);
