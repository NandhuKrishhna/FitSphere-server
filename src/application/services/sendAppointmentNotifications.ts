import { Inject, Service } from "typedi";
import { IUserRepository, IUserRepositoryToken } from "../repositories/IUserRepository";
import { ISlotRepository, ISlotRepositoryToken } from "../repositories/ISlotRepository";
import { AppointmentDocument } from "../../infrastructure/models/appointmentModel";
import { INotificationRepository, INotificationRepositoryToken } from "../repositories/INotificationRepository";
import Role from "../../shared/constants/UserRole";
import { NotificationType } from "../../shared/constants/verficationCodeTypes";
import { formatDate, formatToIndianTime } from "../../shared/utils/timeConvertor";
import { getReceiverSocketId } from "../../infrastructure/config/socket.io";
import { emitNotification } from "../../shared/utils/emitNotification";
import { SlotDocument } from "../../infrastructure/models/slot.models";
import logger from "../../shared/utils/logger";

@Service()
export class SendAppointmentNotifications {
    constructor(
        @Inject(IUserRepositoryToken) private userRepository: IUserRepository,
        @Inject(ISlotRepositoryToken) private slotRepository: ISlotRepository,
        @Inject(INotificationRepositoryToken) private notificationRepository: INotificationRepository,
    ) { }

    async sendAppointmentNotifications(appointment: AppointmentDocument, doctorName: string, updatedSlotDetails: SlotDocument) {
        const userDetails = await this.userRepository.findUserById(appointment.patientId);
        logger.info("UserDetails", userDetails)

        const [doctorNotification, patientNotification] = await Promise.all([
            this.notificationRepository.createNotification({
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
            this.notificationRepository.createNotification({
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
        logger.info(doctorNotification)
        logger.info(patientNotification)

        const doctorSocketId = getReceiverSocketId(appointment.doctorId.toString());
        const patientSocketId = getReceiverSocketId(appointment.patientId.toString());


        emitNotification(doctorSocketId, doctorNotification.message);
        emitNotification(patientSocketId, patientNotification.message);
    }

}