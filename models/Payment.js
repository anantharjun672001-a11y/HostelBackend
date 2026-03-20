import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    residentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    billId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Bill"
    },
    amount:{
        type:Number,
    },
    paymentId:{
        type:String,
    },
    orderId:{
        type:String,
    },
    status:{
        type:String,
        enum:["Pending","Success","Failed"]
    },
    method:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now
    }
});

const Payment = mongoose.model("Payment",paymentSchema)

export default Payment;