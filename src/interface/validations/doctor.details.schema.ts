import { z } from "zod";

export const doctorDetailsSchema = z.object({
    professionalTitle: z.string().min(2, { message: "Title must be at least 2 characters long." }),
    gender: z.enum(["Male", "Female"]),
    profilePicture: z.string().url({ message: "Invalid URL for profile picture." }),
    contactPhoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format." }),
    professionalEmail: z.string().email({ message: "Invalid email address." }),
    officeAddress: z.string().min(5, { message: "Office address must be at least 5 characters long." }),
    clinicLocations: z.array(z.string().min(3, { message: "Clinic location must be at least 3 characters long." })),
    consultationFees: z
      .number()
      .positive({ message: "Consultation fees must be a positive number." })
      .max(10000, { message: "Consultation fees cannot exceed $10,000." }),
    consultationLanguages: z
      .array(z.string().min(2, { message: "Language must be at least 2 characters long." }))
      .nonempty({ message: "At least one language must be provided." }),
    primarySpecialty: z.string().min(3, { message: "Primary specialty must be at least 3 characters long." }),
    secondarySpecialties: z.array(z.string().min(3, { message: "Secondary specialty must be at least 3 characters long." })),
    areasOfExpertise: z.array(z.string().min(3, { message: "Area of expertise must be at least 3 characters long." })),
    specificTreatmentFocuses: z.array(z.string().min(3, { message: "Treatment focus must be at least 3 characters long." })),
    medicalLicenseNumber: z.string().min(5, { message: "Medical license number must be at least 5 characters long." }),
    experience: z
      .number()
      .int({ message: "Experience must be an integer." })
      .positive({ message: "Experience must be a positive number." }),
    bio: z.string().min(10, { message: "Bio must be at least 10 characters long." }),
  });