import { Inject, Service } from "typedi";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from "../../shared/constants/http";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { ObjectId } from "../../infrastructure/models/UserModel";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";

@Service()
export class WebRtcUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken) private appointmentRepository: IAppointmentRepository,
    @Inject(ISlotRepositoryToken) private slotRepository: ISlotRepository
  ) {}

  async videoMeeting(meetingId: string, userId: ObjectId, role: string): Promise<AppointmentDocument> {
    console.log(userId, role);
    const appointment = await this.appointmentRepository.findAppointmentByMeetingId(meetingId);
    console.log("Appointment", appointment);
    appAssert(appointment, NOT_FOUND, "Invalid meeting ID");
    //TODO according to the role of the user, we need to check the user is authorized to join the meeting
    appAssert(appointment.patientId !== userId, UNAUTHORIZED, "You are not authorized to join this meeting");
    appAssert(appointment.paymentStatus === "completed", BAD_REQUEST, "Payment is not completed for this appointment");
    const slotDetails = await this.slotRepository.findSlotById(appointment.slotId);
    console.log(slotDetails);
    appAssert(slotDetails, NOT_FOUND, "Slot details not found");
    const currentTime = new Date();
    const currentISTTime = new Date(currentTime.getTime() + 5.5 * 60 * 60 * 1000);
    console.log("Current IST Time:", currentISTTime);

    const slotStartTime = new Date(slotDetails.startTime);
    const slotEndTime = new Date(slotDetails.endTime);
    console.log("Slot Start Time:", slotStartTime);
    console.log("Slot End Time:", slotEndTime);

    appAssert(
      currentISTTime >= slotStartTime && currentISTTime <= slotEndTime,
      BAD_REQUEST,
      "You can only join the meeting during the scheduled time"
    );

    return appointment;
  }
}
