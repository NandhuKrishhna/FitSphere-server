import { Token } from "typedi";
import { AppointmentDocument } from "../../../infrastructure/models/appointmentModel";
import { ObjectId } from "../../../infrastructure/models/UserModel";

export interface IWebRtcUseCase {
    videoMeeting(meetingId: string, userId: ObjectId, role: string): Promise<AppointmentDocument>;
    leavingMeetAndUpdateStatus(meetingId: string): Promise<void>
}
export const IWebRtcUseCaseToken = new Token<IWebRtcUseCase>();