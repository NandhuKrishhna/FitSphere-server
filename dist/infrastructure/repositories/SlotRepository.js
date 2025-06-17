"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRepository = void 0;
const typedi_1 = require("typedi");
const ISlotRepository_1 = require("../../application/repositories/ISlotRepository");
const slot_models_1 = require("../models/slot.models");
function startOfTodayIST() {
    const now = new Date();
    // Convert to IST and reset to start of day
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = now.getTime() + istOffset;
    const startOfDayIST = new Date(istTime);
    startOfDayIST.setUTCHours(0, 0, 0, 0);
    return new Date(startOfDayIST.getTime() - istOffset);
}
let SlotRepository = class SlotRepository {
    findSlotDetails(id, startTime, endTime, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const slotDetails = yield slot_models_1.SlotModel.findOne({
                doctorId: id,
                date,
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            });
            return slotDetails;
        });
    }
    createSlot(slot) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_models_1.SlotModel.create(slot);
        });
    }
    findAllActiveSlots(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDateUTC = new Date();
            const currentDateIST = new Date(currentDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
            const todayDateIST = currentDateIST.toISOString().split("T")[0];
            const slots = yield slot_models_1.SlotModel.find({
                doctorId,
                date: { $gte: new Date(todayDateIST) },
            }).sort({ date: 1, startTime: 1 });
            return slots;
        });
    }
    findSlotById(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_models_1.SlotModel.findOne({ _id: slotId });
        });
    }
    deleteSlot(doctorId, slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield slot_models_1.SlotModel.deleteOne({ doctorId: doctorId, _id: slotId });
        });
    }
    updateSlot(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_models_1.SlotModel.findOneAndUpdate({ _id: id }, updates, { new: true });
        });
    }
    updateSlotById(slotId, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedSlot = yield slot_models_1.SlotModel.findOneAndUpdate({ _id: slotId }, {
                $set: {
                    patientId: patientId,
                    updatedAt: new Date(),
                    status: "booked",
                },
            });
            return updatedSlot;
        });
    }
    cancelSlotById(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield slot_models_1.SlotModel.findByIdAndUpdate(slotId, {
                $unset: { patientId: "" },
                status: "available",
                updatedAt: new Date(),
            });
        });
    }
    findAllSlots(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield slot_models_1.SlotModel.find({ doctorId });
            return slots;
        });
    }
};
exports.SlotRepository = SlotRepository;
exports.SlotRepository = SlotRepository = __decorate([
    (0, typedi_1.Service)(ISlotRepository_1.ISlotRepositoryToken)
], SlotRepository);
