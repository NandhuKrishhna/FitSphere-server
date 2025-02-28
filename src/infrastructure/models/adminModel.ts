import mongoose, { Model, Schema } from "mongoose";
import { comparePassword, hashPassword } from "../../shared/utils/bcrypt";

export interface AdminDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<AdminDocument, "_id" | "name" | "email" | "createdAt" | "updatedAt">;
}

const AdminSchema: Schema = new Schema<AdminDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password as string);
});

AdminSchema.methods.comparePassword = async function (val: string): Promise<boolean> {
  return comparePassword(val, this.password);
};

AdminSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const AdminModel: Model<AdminDocument> = mongoose.model<AdminDocument>("Admin", AdminSchema);
