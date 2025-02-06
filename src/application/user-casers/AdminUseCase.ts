import { Inject, Service } from "typedi";
import { LoginUserParams } from "../../domain/types/userTypes";
import { IAdminRepository, IAdminRepositoryToken } from "../repositories/IAdminRepository";
import appAssert from "../../shared/utils/appAssert";
import { UNAUTHORIZED } from "../../shared/constants/http";
import mongoose from "mongoose";
import { oneYearFromNow } from "../../shared/utils/date";
import { ISessionRepository, ISessionRepositoryToken } from "../repositories/ISessionRepository";
import { AccessTokenPayload, RefreshTokenPayload, refreshTokenSignOptions, signToken } from "../../shared/utils/jwt";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import { IDoctorRepository, IDoctorRepositoryToken } from "../repositories/IDoctorReposirtory";
import { sendMail } from "../../shared/constants/sendMail";
import { getApprovalEmailTemplate, getRejectionEmailTemplate } from "../../shared/utils/emialTemplates";



@Service()
export class AdminUseCase  {
  constructor(
    @Inject(IAdminRepositoryToken) private adminRepository: IAdminRepository,
    @Inject(ISessionRepositoryToken)private sessionRepository: ISessionRepository,
    @Inject(INotificationRepositoryToken) private notificationRepository: INotificationRepository,
    @Inject(IDoctorRepositoryToken) private doctorRepository: IDoctorRepository
  ){}

 // method for admin login 
  async adminLogin(adminData: LoginUserParams){
    const existingUser  = await this.adminRepository.findAdminByEmail(adminData.email);
    appAssert(existingUser, UNAUTHORIZED, "Invalid email or user does not exist");
    const isValid = await existingUser.comparePassword(adminData.password);
    appAssert(isValid, UNAUTHORIZED, "Invalid email or password!");
    const newSession = {
          userId: new mongoose.Types.ObjectId(existingUser._id),
          userAgent: adminData.userAgent,
          createdAt: new Date(),
          expiresAt: oneYearFromNow(),
        };
        const session = await this.sessionRepository.createSession(newSession);
      
        const sessionInfo: RefreshTokenPayload = {
          sessionId: session._id ?? new mongoose.Types.ObjectId(),
        };
        const adminID = existingUser._id;
            const accessToken = signToken({
              ...sessionInfo,
              userId: adminID,
            });
            const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
          
            return {
              user: existingUser.omitPassword(),
              accessToken,
              refreshToken,
            };
  }

  async getAllUsers(){
    const users = await this.adminRepository.getAllUsers();
    return users;
  }

  async getAllDoctors(){
    const doctors = await this.adminRepository.getAllDoctors();
    return doctors;
  }

  async logoutAdmin(payload: AccessTokenPayload) {
    await this.sessionRepository.findByIdAndDelete(payload.sessionId);
  }
  async getNotification(){
   const notification =  await this.notificationRepository.getAllNotifications();
   return {
    notification
   }
  }

  async approveRequest(id: mongoose.Types.ObjectId){
   await this.adminRepository.approveRequest(id);
    const user = await this.doctorRepository.findDoctorByID(id)
    if(user){
      await sendMail({
         to: user.email,
        ...getApprovalEmailTemplate()
      })
    }
    }
    


  async rejectRequest(id: mongoose.Types.ObjectId){
    await this.adminRepository.rejectRequest(id);

  }
}