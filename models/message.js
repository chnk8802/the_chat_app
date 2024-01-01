import mongoose from "mongoose";
const messsage = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    }
},
    {
        timestamps: true
    }
);

const Message = mongoose.model("Message", messsage);
export default Message;