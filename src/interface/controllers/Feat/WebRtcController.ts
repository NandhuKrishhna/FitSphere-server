import { Request, Response } from "express";
import catchErrors from "../../../shared/utils/catchErrors";
import appAssert from "../../../shared/utils/appAssert";
import { NOT_FOUND, OK } from "../../../shared/constants/http";
import { Inject, Service } from "typedi";
import { WebRtcUseCase } from "../../../application/user-casers/WebRtcUseCase";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
@Service()
export class WebRtcController {
  constructor(@Inject() private webRtcUseCase: WebRtcUseCase) { }

  videoMeetingHandler = catchErrors(async (req: Request, res: Response) => {
    const meetingId = req.body.meetingId;
    const { userId } = req as AuthenticatedRequest;
    const { role } = req as AuthenticatedRequest;
    appAssert(meetingId, NOT_FOUND, "Meeting id is required. Or invalid meeting id");
    const appointment = await this.webRtcUseCase.videoMeeting(meetingId, userId, role);
    return res.status(OK).json({
      success: true,
      message: "Successfully joined the meeting",
      meetingId: appointment.meetingId,
    });
  });

  leavingMeetAndUpdateStatus = catchErrors(async (req: Request, res: Response) => {
    const meetingId = req.body.meetingId;
    const { userId } = req as AuthenticatedRequest;
    const { role } = req as AuthenticatedRequest;
    appAssert(meetingId, NOT_FOUND, "Meeting id is required. Or invalid meeting id");
    await this.webRtcUseCase.leavingMeetAndUpdateStatus(meetingId,);
    return res.status(OK).json({ success: true, message: "Successfully left the meeting" });
  });
}
