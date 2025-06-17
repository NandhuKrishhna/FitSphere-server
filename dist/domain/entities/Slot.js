"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
class Slot {
    constructor(_id, doctorId, startTime, endTime, date, consultationType = "video", status = "available", // Added 'completed' & 'expired'
    patientId, createdAt, updatedAt) {
        this._id = _id;
        this.doctorId = doctorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.date = date;
        this.consultationType = consultationType;
        this.status = status;
        this.patientId = patientId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Slot = Slot;
