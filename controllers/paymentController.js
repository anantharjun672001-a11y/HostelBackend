import crypto from "crypto";
import Payment from "../models/Payment.js";
import Bill from "../models/Bill.js";

export const razorpayWebhook = async (req, res) => {

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

        bill.status = "paid";
        bill.paymentDate = new Date();
        await bill.save();

        await Payment.create({
          residentId: bill.resident,
          billId: bill._id,
          amount: bill.total,
          paymentId: payment.id,
          orderId: payment.order_id,
          status: "Success",
          method: payment.method
        });

        console.log(" Payment saved in DB");

      }

    }

    res.status(200).json({ success: true });

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: "Webhook error" });

  }

};