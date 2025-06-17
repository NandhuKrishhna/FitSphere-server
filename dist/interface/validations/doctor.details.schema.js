"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorUpdateSchema = exports.doctorDetailsSchema = void 0;
const zod_1 = require("zod");
exports.doctorDetailsSchema = zod_1.z.object({
    professionalTitle: zod_1.z.string().min(2, { message: "Title must be at least 2 characters long." }),
    gender: zod_1.z.enum(["Male", "Female"]),
    contactPhoneNumber: zod_1.z
        .string()
        .min(10, { message: "Phone number must be at least 10 digits." })
        .max(10, { message: "Phone number must be exactly 10 digits." })
        .regex(/^\d{10}$/, { message: "Phone number must contain exactly 10 digits." })
        .default(""),
    professionalEmail: zod_1.z.string().email({ message: "Invalid email address." }),
    officeAddress: zod_1.z.string().min(5, { message: "Office address must be at least 5 characters long." }),
    clinicLocations: zod_1.z.string().min(3, { message: "Clinic location must be at least 3 characters long." }),
    consultationFees: zod_1.z
        .string()
        .regex(/^\d+$/, { message: "Consultation fees must be a positive number." })
        .max(5, { message: "Consultation fees cannot exceed 5 digits." })
        .default("0"),
    consultationLanguages: zod_1.z.string().min(2, { message: "Language must be at least 2 characters long." }).default(""),
    primarySpecialty: zod_1.z.string().min(3, { message: "Primary specialty must be at least 3 characters long." }),
    medicalLicenseNumber: zod_1.z.string().min(5, { message: "Medical license number must be at least 5 characters long." }),
    experience: zod_1.z
        .string()
        .min(1, { message: "Experience must be at least 1 year." })
        .regex(/^\d+$/, { message: "Experience must be a positive number." })
        .default("0"),
    bio: zod_1.z.string().min(10, { message: "Bio must be at least 10 characters long." }),
    certificate: zod_1.z.string(),
});
exports.doctorUpdateSchema = exports.doctorDetailsSchema.partial();
