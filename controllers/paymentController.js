import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Bill from "../models/Bill.js";
import Resident from "../models/Resident.js";
import Room from "../models/Room.js";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// CREATE ORDER

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.body;

    let resident = await Resident.findOne({ userId });
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // create resident if not exists
    if (!resident) {
      resident = await Resident.create({
        userId,
        phone: "0000000000",
        address: "Default",
        emergencyContact: "Default",
        hasPaidAdvance: false,
      });
    }

    let amount = room.price;

    // first payment → advance + rent
    if (!resident.hasPaidAdvance) {
      amount = room.price * 2;
    }

    // create bill 
    const bill = await Bill.create({
      resident: resident._id,
      room: room._id,
      rent: room.price,
      total: amount,
      status: "pending",
      month: new Date().toISOString().slice(0, 7),
    });

    // create razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: bill._id.toString(),
      notes: {
        billId: bill._id.toString(),
      },
    });

    res.json({
      orderId: order.id,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};


// WEBHOOK

/* export const razorpayWebhook = async (req, res) => {
  console.log(" WEBHOOK HIT");
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const billId = payment.notes.billId;

      const bill = await Bill.findById(billId);

      if (bill) {
        // mark bill paid
        bill.status = "paid";
        bill.paymentDate = new Date();
        await bill.save();

        // save payment
        await Payment.create({
          residentId: bill.resident,
          billId: bill._id,
          amount: bill.total,
          paymentId: payment.id,
          orderId: payment.order_id,
          status: "Success",
          method: payment.method,
        });

        // assign room AFTER payment
        const resident = await Resident.findById(bill.resident);
        const room = await Room.findById(bill.room);

        if (resident && room) {
          resident.room = room._id;
          resident.hasPaidAdvance = true;
          await resident.save();

          room.occupied += 1;
          await room.save();
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("WEBHOOK ERROR:", error);
    res.status(500).json({ message: "Webhook error" });
  }
};

 */