"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typedi_1 = __importDefault(require("typedi"));
const WebRtcController_1 = require("../../controllers/Feat/WebRtcController");
const webrtcRouter = (0, express_1.Router)();
const webrtcController = typedi_1.default.get(WebRtcController_1.WebRtcController);
webrtcRouter.post("/meeting", webrtcController.videoMeetingHandler);
webrtcRouter.post("/leave-meeting", webrtcController.leavingMeetAndUpdateStatus);
exports.default = webrtcRouter;
