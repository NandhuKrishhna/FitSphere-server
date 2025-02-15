import mongoose, { SortOrder } from "mongoose";

export type SlotDocument = {
    _id: mongoose.Types.ObjectId;
    doctorId:  mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    date: Date;
    consultationType: "video" | "audio" | "chat";
    status: "available" | "booked" | "cancelled";
    patientId?:  mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };
  

  export type GetSlotsPros ={
    doctorId: mongoose.Types.ObjectId,
    page :number  
    limit : number 
    sort : string[]
    order : number
  };

  export type SlotQueryProps = {
    doctorId: mongoose.Types.ObjectId;
    page: number;
    limit: number;
    sort?: string[];

  };
  
  export function startOfTodayIST(): Date {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(now.getUTCHours() + 5); // Adjust to IST
    now.setUTCMinutes(now.getUTCMinutes() + 30);
    return now;
  };


  export type DisplayAllSlotsOptions = {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    filters: {
      status?: string;
      consultationType?: string;
      date?: string;
    };
  }


  export interface AppointmentFilters {
    status?: string;
    paymentStatus?: string;
    consultationType?: string;
  }
  
  export interface AppointmentProps {
    doctorId: mongoose.Types.ObjectId;
    filters: AppointmentFilters;
    page: number;
    limit: number;
  }