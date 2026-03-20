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
      required: true,
    },
    emergencyContact: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
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
  },
  { timestamps: true },
);

const Resident = mongoose.model("Resident", residentSchema);

export default Resident;
