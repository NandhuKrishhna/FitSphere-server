"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcreateDoctorDetails = IcreateDoctorDetails;
exports.IcreateSlot = IcreateSlot;
const mongoose_1 = __importDefault(require("mongoose"));
const DoctorDetails_1 = require("../../domain/entities/DoctorDetails");
function IcreateDoctorDetails(userId, experience, consultationFees, contactPhoneNumber, professionalEmail, officeAddress, clinicLocations, consultationLanguages, primarySpecialty, medicalLicenseNumber, gender, professionalTitle, bio, certificate) {
    return new DoctorDetails_1.DoctorDetails(new mongoose_1.default.Types.ObjectId(), userId, experience, consultationFees, contactPhoneNumber, professionalEmail, officeAddress, clinicLocations, consultationLanguages, primarySpecialty, medicalLicenseNumber, gender, professionalTitle, bio, certificate);
}
function IcreateSlot(doctorId, startTime, endTime, date, consultationType) {
    return {
        _id: new mongoose_1.default.Types.ObjectId(),
        doctorId,
        startTime,
        endTime,
        date,
        consultationType,
        status: "available",
    };
}
