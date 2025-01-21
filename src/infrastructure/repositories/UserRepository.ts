import { Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../../application/repositories/IUserRepository";
import { UserModel } from "../models/UserModel";
import { User } from "../../domain/entities/User";

@Service({ id: IUserRepositoryToken })
export class UserRepository implements IUserRepository {
  async createUser(user: User): Promise<User> {
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
}
