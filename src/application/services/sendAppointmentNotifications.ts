import { Inject, Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import Role from "../../shared/constants/UserRole";
import { NotificationType } from "../../shared/constants/verificationCodeTypes";
import { formatDate, formatToIndianTime } from "../../shared/utils/timeConvertor";
import { getReceiverSocketId } from "../../infrastructure/config/socket.io";
import { emitNotification } from "../../shared/utils/emitNotification";
import { SlotDocument } from "../../infrastructure/models/slot.models";

@Service()
export class SendAppointmentNotifications {
    constructor(
        @Inject(IUserRepositoryToken) private _userRepository: IUserRepository,
        @Inject(ISlotRepositoryToken) private _slotRepository: ISlotRepository,
        @Inject(INotificationRepositoryToken) private __notificationRepository: INotificationRepository,
    ) { }

    async sendAppointmentNotifications(appointment: AppointmentDocument, doctorName: string, updatedSlotDetails: SlotDocument) {
        const userDetails = await this._userRepository.findUserById(appointment.patientId);

        const [doctorNotification, patientNotification] = await Promise.all([
            this.__notificationRepository.createNotification({
                userId: appointment.doctorId,
                role: Role.DOCTOR,
                type: NotificationType.Appointment,
                message: `A new appointment with ${userDetails?.name}
                 has been scheduled on ${formatDate(updatedSlotDetails?.date?.toISOString()!)}
                 at ${formatToIndianTime(updatedSlotDetails?.startTime?.toISOString()!)}
                  - ${formatToIndianTime(updatedSlotDetails?.endTime?.toISOString()!)}`,
                metadata: {
                    meetingId: appointment.meetingId,
                    appointMentId: appointment._id,
                },
            }),
            this.__notificationRepository.createNotification({
                userId: appointment.patientId,
                role: Role.USER,
                type: NotificationType.Appointment,
                message: `Your appointment with ${doctorName}
                 has been scheduled on ${formatDate(updatedSlotDetails?.date?.toISOString()!)}
                 at ${formatToIndianTime(updatedSlotDetails?.startTime?.toISOString()!)}
                  - ${formatToIndianTime(updatedSlotDetails?.endTime?.toISOString()!)}`,
                metadata: {
                    meetingId: appointment.meetingId,
                    appointMentId: appointment._id,
                },
            }),
        ]);

        const doctorSocketId = getReceiverSocketId(appointment.doctorId.toString());
        const patientSocketId = getReceiverSocketId(appointment.patientId.toString());


        emitNotification(doctorSocketId, doctorNotification.message);
        emitNotification(patientSocketId, patientNotification.message);
    }

}