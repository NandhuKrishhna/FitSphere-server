"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRtcController = void 0;
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const http_1 = require("../../../shared/constants/http");
const typedi_1 = require("typedi");
const WebRtcUseCase_1 = require("../../../application/user-casers/WebRtcUseCase");
let WebRtcController = class WebRtcController {
    constructor(_webRtcUseCase) {
        this._webRtcUseCase = _webRtcUseCase;
        //** @desc video meeting handler */
        this.videoMeetingHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const meetingId = req.body.meetingId;
            const { userId } = req;
            const { role } = req;
            (0, appAssert_1.default)(meetingId, http_1.NOT_FOUND, "Meeting id is required. Or invalid meeting id");
            const appointment = yield this._webRtcUseCase.videoMeeting(meetingId, userId, role);
            return res.status(http_1.OK).json({
                success: true,
                message: "Successfully joined the meeting",
                meetingId: appointment.meetingId,
            });
        }));
        //** @desc end meeting handler */
        this.leavingMeetAndUpdateStatus = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const meetingId = req.body.meetingId;
            const { userId } = req;
            const { role } = req;
            (0, appAssert_1.default)(meetingId, http_1.NOT_FOUND, "Meeting id is required. Or invalid meeting id");
            yield this._webRtcUseCase.leavingMeetAndUpdateStatus(meetingId);
            return res.status(http_1.OK).json({ success: true, message: "Successfully left the meeting" });
        }));
    }
};
exports.WebRtcController = WebRtcController;
exports.WebRtcController = WebRtcController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [WebRtcUseCase_1.WebRtcUseCase])
], WebRtcController);
