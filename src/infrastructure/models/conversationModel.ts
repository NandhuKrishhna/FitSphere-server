import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema: Schema<IConversation> = new Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: [(arr: string[]) => arr.length === 2, "{PATH} must contain exactly 2 participants"],
    },
    lastMessage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ConversationModel: Model<IConversation> = mongoose.model<IConversation>("Conversation", conversationSchema);
export default ConversationModel;
