import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    required: true 
  },
  senderId: { 
    type: String,  // Using email as sender ID
    required: true 
  },
  receiverId: { 
    type: String,  // Using email as receiver ID
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  readAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
