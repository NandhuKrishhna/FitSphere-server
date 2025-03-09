import bcrypt from "bcrypt";
import mongoose from "mongoose";
export const hashPassword = async (value: string, saltRounds?: number) => bcrypt.hash(value, saltRounds || 10);

export const comparePassword = async (value: string, hashedValue: string) =>
  bcrypt.compare(value, hashedValue).catch(() => false);

export const stringToObjectId = (id: string): mongoose.Types.ObjectId => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId format");
  }
  return new mongoose.Types.ObjectId(id);
};
