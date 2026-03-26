import mongoose from "mongoose";

const residentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
      default:null,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    hasPaidAdvance:{
        type:Boolean,
        default:false
    },
  },
  { timestamps: true },
);

const Resident = mongoose.model("Resident", residentSchema);

export default Resident;

