"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointments = void 0;
class Appointments {
    constructor(_id, doctorId, patientId, slotId, consultationType = "video", date, paymentStatus = "pending", amount, paymentId, PaymentThrough, status = "scheduled", createdAt, updatedAt) {
        this._id = _id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.slotId = slotId;
        this.consultationType = consultationType;
        this.date = date;
        this.paymentStatus = paymentStatus;
        this.amount = amount;
        this.paymentId = paymentId;
        this.PaymentThrough = PaymentThrough;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Appointments = Appointments;
