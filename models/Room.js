import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomNumber:{
        type:String,
        required:true,
        unique:true,

    },
    type:{
        type:String,
        enum : ["double","triple","quad","queen","king"],
        required:true,
    },
    capacity:{
        type:Number,
        required:true,
    },
    occupied:{
        type:Number,
        default:0,
    },
    residents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Resident",
        },
    ],
},
{ timestamps:true}
);

const Room = mongoose.model("Room",roomSchema);

export default Room;