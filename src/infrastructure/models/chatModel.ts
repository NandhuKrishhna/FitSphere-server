import mongoose, { Schema, Document, Model } from 'mongoose';
export interface IChat extends Document {
  conversationId: mongoose.Types.ObjectId; 
  senderId: mongoose.Types.ObjectId;      
  receiverId: mongoose.Types.ObjectId;    
  message: string; 
  image?: string;      
  isRead: boolean;     
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema: Schema<IChat> = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Conversation", required:true 
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required:true 
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    image :{
      type: String
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

const ChatModel: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
export default ChatModel;