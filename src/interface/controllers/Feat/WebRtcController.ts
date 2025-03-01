import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import appAssert from "../../../shared/utils/appAssert";
import { NOT_FOUND, OK } from "../../../shared/constants/http";
import { Inject, Service } from "typedi";
import { WebRtcUseCase } from "../../../application/user-casers/WebRtcUseCase";
@Service()
export class WebRtcController {
  constructor(@Inject() private webRtcUseCase: WebRtcUseCase) {}

  videoMeetingHandler = catchErrors(async (req: Request, res: Response) => {
    const meetingId = req.params.meetingId;
    appAssert(meetingId, NOT_FOUND, "Meeting id is required");
    const appointment = await this.webRtcUseCase.videoMeeting(meetingId);
    return res.status(OK).json({
      success: true,
      meetingId: appointment.meetingId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      slotId: appointment.slotId,
    });
  });
}
