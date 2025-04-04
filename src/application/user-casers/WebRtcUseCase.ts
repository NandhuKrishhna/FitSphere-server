import { Inject, Service } from "typedi";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from "../../shared/constants/http";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";
import { IWebRtcUseCase, IWebRtcUseCaseToken } from "./interface/IWebRtcUseCase";

@Service()
export class WebRtcUseCase implements IWebRtcUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken) private _appointmentRepository: IAppointmentRepository,
    @Inject(ISlotRepositoryToken) private _slotRepository: ISlotRepository
  ) { };

  async videoMeeting(meetingId: string, userId: ObjectId, role: string): Promise<AppointmentDocument> {
    const appointment = await this._appointmentRepository.findAppointmentByMeetingId(meetingId);
    appAssert(appointment, NOT_FOUND, "Invalid meeting ID");
    if (role === "user") {
      appAssert(appointment.patientId.equals(userId), UNAUTHORIZED, "You are not authorized to join this meeting");
    } else if (role === "doctor") {
      appAssert(appointment.doctorId.equals(userId), UNAUTHORIZED, "You are not authorized to join this meeting");
    } else {
      appAssert(false, UNAUTHORIZED, "Invalid role");
    }
    appAssert(appointment.paymentStatus === "completed", BAD_REQUEST, "Payment is not completed for this appointment");
    const slotDetails = await this._slotRepository.findSlotById(appointment.slotId);
    appAssert(slotDetails, NOT_FOUND, "Slot details not found");
    const currentTime = new Date();
    const currentISTTime = new Date(currentTime.getTime() + 5.5 * 60 * 60 * 1000);

    const slotStartTime = new Date(slotDetails.startTime);
    const slotEndTime = new Date(slotDetails.endTime);

    appAssert(
      currentISTTime >= slotStartTime && currentISTTime <= slotEndTime,
      BAD_REQUEST,
      "You can only join the meeting during the scheduled time"
    );

    return appointment;
  }

  async leavingMeetAndUpdateStatus(meetingId: string) {
    appAssert(meetingId, NOT_FOUND, "Meeting id is required. Or invalid meeting id");
    await this._appointmentRepository.updateMeetingStatus(meetingId);
  }
}
