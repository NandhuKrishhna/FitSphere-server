import { z } from "zod";

export const doctorDetailsSchema = z.object({
  professionalTitle: z.string().min(2, { message: "Title must be at least 2 characters long." }),
  gender: z.enum(["Male", "Female"]),
  
  contactPhoneNumber: z
  .string()
  .min(10, { message: "Phone number must be at least 10 digits." })
  .max(10, { message: "Phone number must be exactly 10 digits." })  
  .regex(/^\d{10}$/, { message: "Phone number must contain exactly 10 digits." })
  .default(""),

  professionalEmail: z.string().email({ message: "Invalid email address." }),
  officeAddress: z.string().min(5, { message: "Office address must be at least 5 characters long." }),
  clinicLocations: z.string().min(3, { message: "Clinic location must be at least 3 characters long." }),
  consultationFees: z
    .string()
    .regex(/^\d+$/, { message: "Consultation fees must be a positive number." })
    .max(5, { message: "Consultation fees cannot exceed 5 digits." })
    .default("0"),

  consultationLanguages: z
    .string()
    .min(2, { message: "Language must be at least 2 characters long." })
    .default(""),
  primarySpecialty: z.string().min(3, { message: "Primary specialty must be at least 3 characters long." }),
  medicalLicenseNumber: z.string().min(5, { message: "Medical license number must be at least 5 characters long." }),

  experience: z
    .string()
    .min(1, { message: "Experience must be at least 1 year." })
    .regex(/^\d+$/, { message: "Experience must be a positive number." })
    .default("0"),

  bio: z.string().min(10, { message: "Bio must be at least 10 characters long." }),
});
