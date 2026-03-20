import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    month: {
      type: String,
      required: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    utilities: {
      type: Number,
      default: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
    },
    receipt: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "unpaid",
    },
    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
