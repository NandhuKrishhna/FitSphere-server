import { ObjectId } from "../../infrastructure/models/UserModel";

type DoctorDetails = {
    _id: string;
    name: string;
    profilePicture: string;
};

type User = {
    _id: string;
    updatedAt?: string;
    lastMessage: string;
    doctorDetails: DoctorDetails;
};

export type QueryResult = User[];


export type ConversationResponse = {
    _id: ObjectId,
    doctorDetails: DoctorDetails,
    lastMessage: string
}
