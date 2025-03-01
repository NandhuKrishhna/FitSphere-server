import { Inject, Service } from "typedi";
import { IAppointmentRepository, IAppointmentRepositoryToken } from "../repositories/IAppointmentRepository";
import appAssert from "../../shared/utils/appAssert";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from "../../shared/constants/http";
import { Appointment } from "../../domain/entities/Appointments";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";

@Service()
export class WebRtcUseCase {
  constructor(
    @Inject(IAppointmentRepositoryToken) private appointmentRepository: IAppointmentRepository,
    @Inject(ISlotRepositoryToken) private slotRepository: ISlotRepository
  ) {}

  async videoMeeting(meetingId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findAppointmentByMeetingId(meetingId);
    appAssert(appointment, NOT_FOUND, "Invalid meeting ID");
    const slotDetails = await this.slotRepository.findSlotById(appointment.slotId);
    appAssert(appointment.status === "scheduled", BAD_REQUEST, "Meeting is not scheduled");
    // const currentDateUTC = new Date();
    // const currentDateIST = new Date(currentDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
    // appAssert(
    //   currentDateIST < slotDetails!.startTime,
    //   FORBIDDEN,
    //   "Meeting is not yet available. Please wait until the scheduled time."
    // );
    return appointment;
  }
}
