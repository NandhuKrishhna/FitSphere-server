import { Router } from "express";
import Container from "typedi";
import { WebRtcController } from "../../controllers/Feat/WebRtcController";

const webrtcRouter = Router();
const webrtcController = Container.get(WebRtcController);

webrtcRouter.get("/:meetingId", webrtcController.videoMeetingHandler);

export default webrtcRouter;
