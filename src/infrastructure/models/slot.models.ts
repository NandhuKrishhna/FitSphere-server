import mongoose, { Document, Model, Schema } from "mongoose";

export interface SlotDocument extends Document {
  doctorId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  date: Date;
  consultationType: "video" | "audio" | "chat";
  status: "available" | "booked" | "cancelled" | "completed" | "expired";
  patientId?: mongoose.Types.ObjectId;
}

interface SlotModel extends Model<SlotDocument> {
  updateExpiredSlots: () => Promise<void>;
  deleteExpiredSlots: () => Promise<void>;
}

const SlotSchema = new Schema<SlotDocument>(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "cancelled", "completed", "expired"],
      default: "available",
    },
    consultationType: {
      type: String,
      enum: ["video", "audio", "chat"],
      default: "video",
    },
    patientId: { type: mongoose.Schema.Types.ObjectId, required: false },
  },
  { timestamps: true }
);

SlotSchema.statics.updateExpiredSlots = async function () {
  const currentUTC = new Date();
  const currentIST = new Date(currentUTC.getTime() + 5.5 * 60 * 60 * 1000);

  const result = await this.updateMany(
    {
      endTime: { $lt: currentIST },
      patientId: { $exists: false },
      status: "available",
    },
    { status: "expired" }
  );

  console.log(
    `[${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] Updated expired slots: ${
      result.modifiedCount
    }`
  );
};

SlotSchema.statics.deleteExpiredSlots = async function () {
  const currentUTC = new Date();
  const currentIST = new Date(currentUTC.getTime() + 5.5 * 60 * 60 * 1000);

  const startOfTodayIST = new Date(currentIST);
  startOfTodayIST.setHours(0, 0, 0, 0);

  const result = await this.deleteMany({
    status: "expired",
    endTime: { $lt: startOfTodayIST },
  });

  console.log(
    `[${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] Deleted expired slots: ${
      result.deletedCount
    }`
  );
};

setInterval(async () => {
  try {
    await SlotModel.updateExpiredSlots();
    console.log("Expired slots updated successfully.");
  } catch (error) {
    console.error("Error updating expired slots:", error);
  }
}, 30 * 60 * 1000);

const scheduleDeleteExpiredSlots = () => {
  const now = new Date();
  const nowIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

  const nextMidnightIST = new Date(nowIST);
  nextMidnightIST.setHours(24, 0, 0, 0);

  const timeUntilMidnight = nextMidnightIST.getTime() - nowIST.getTime();

  setTimeout(() => {
    setInterval(async () => {
      try {
        await SlotModel.deleteExpiredSlots();
      } catch (error) {
        console.error("Error deleting expired slots:", error);
      }
    }, 24 * 60 * 60 * 1000);
    SlotModel.deleteExpiredSlots();
  }, timeUntilMidnight);
};

scheduleDeleteExpiredSlots();
export const SlotModel: SlotModel = mongoose.model<SlotDocument, SlotModel>("Slot", SlotSchema);
