import { Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../../application/repositories/IUserRepository";
import { UserModel } from "../models/UserModel";
import { User, UserType } from "../../domain/entities/User";
import mongoose, { mongo } from "mongoose";

@Service( IUserRepositoryToken)
export class UserRepository implements IUserRepository {
  async createUser(user: UserType): Promise<UserType> {
   const result = await UserModel.create(user);
   return result
  }
  async findUserByEmail(email: string): Promise<User | null> {
    const result  = await UserModel.findOne({ email });
    return result
  
  }
  async updateUserStatus(email: string, isActive: boolean): Promise<void> {
    await UserModel.updateOne({ email }, { isActive });
  }

  async updateUserById(id: mongoose.Types.ObjectId, updates: Partial<User>): Promise<User | null> {
    const result = await UserModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
    return result;
}

async updateUserByEmail(email: string, updates: Partial<User>): Promise<User | null> {
  const result = await UserModel.findOneAndUpdate(
    { email },
    { $set: updates },
    { new: true }
  )
  return result;
}
 async findUserById(id: mongoose.Types.ObjectId): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user 
 }

 async updateProfile(userId: mongoose.Types.ObjectId, profilePic: string): Promise<User | null> {
  // console.log(profilePic,"Profile picture from repository");
  const result = await UserModel.findOneAndUpdate({ _id: userId }, { profilePicture: profilePic }, { new: true , fields : "_id name email profilePicture role" });
  // console.log(result?.profilePicture,"Profile picture from repository");
  return result;
}


}