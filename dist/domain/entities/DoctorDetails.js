"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorDetails = void 0;
class DoctorDetails {
    constructor(_id, doctorId, experience, consultationFees, contactPhoneNumber, professionalEmail, officeAddress, clinicLocations, consultationLanguages, primarySpecialty, medicalLicenseNumber, gender, professionalTitle, bio, certificate, createdAt, updatedAt) {
        this._id = _id;
        this.doctorId = doctorId;
        this.experience = experience;
        this.consultationFees = consultationFees;
        this.contactPhoneNumber = contactPhoneNumber;
        this.professionalEmail = professionalEmail;
        this.officeAddress = officeAddress;
        this.clinicLocations = clinicLocations;
        this.consultationLanguages = consultationLanguages;
        this.primarySpecialty = primarySpecialty;
        this.medicalLicenseNumber = medicalLicenseNumber;
        this.gender = gender;
        this.professionalTitle = professionalTitle;
        this.bio = bio;
        this.certificate = certificate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.doctorId = doctorId !== null && doctorId !== void 0 ? doctorId : professionalEmail;
    }
}
exports.DoctorDetails = DoctorDetails;
