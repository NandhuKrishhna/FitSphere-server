import { Router } from "express";
import Container from "typedi";
import { WebRtcController } from "../../controllers/Feat/WebRtcController";

const webrtcRouter = Router();
const webrtcController = Container.get(WebRtcController);

webrtcRouter.post("/meeting", webrtcController.videoMeetingHandler);
webrtcRouter.post("/leave-meeting", webrtcController.leavingMeetAndUpdateStatus);

export default webrtcRouter;
