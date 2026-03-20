import Bill from "../models/Bill.js";
import Resident from "../models/Resident.js";
import dotenv from "dotenv";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";

dotenv.config();

// Create Bill
export const createBill = async (req, res) => {
  try {
    const { residentId, month, rent, utilities, lateFee, discount } = req.body;

    if (!residentId || !month || !rent) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const existingBill = await Bill.findOne({ resident: residentId, month });
    if (existingBill) {
      return res
        .status(400)
        .json({ message: "Bill already exists for this month" });
    }

    const total =
      Number(rent) +
      Number(utilities || 0) +
      Number(lateFee || 0) -
      Number(discount || 0);

    const bill = await Bill.create({
      resident: residentId,
      room: resident.room,
      month,
      rent,
      utilities,
      lateFee,
      discount,
      total,
      createdBy: req.user.id,
    });
    if (resident.userId) {
      await Notification.create({
        user: resident.userId,
        message: `New bill generated for ${month}`,
        type: "bill",
      });
    }


    res.status(201).json(bill);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error Creating Bill",
      error: error.message,
    });
  }
};

// Get All Bills (Admin)

export const getBills = async (req,res)=>{

 const bills = await Bill.find()
   .populate({
     path:"resident",
     populate:[
       { path:"userId", select:"name" },
       { path:"room", select:"roomNumber" }
     ]
   })
   .sort({ createdAt:-1 });

 res.status(200).json(bills);

};

//Resident Bills
export const getMyBill = async (req,res)=>{

  try{

    const resident = await Resident.findOne({ userId:req.user.id });

    if(!resident){
      console.log("Resident profile not found for user:", req.user.id);
      return res.status(200).json([]);
    }

    const bills = await Bill.find({ resident: resident._id })
      .populate({
        path:"resident",
        populate:{
          path:"room",
          select:"roomNumber"
        }
      })
      .sort({ createdAt:-1 });

    res.status(200).json(bills);

  }catch(error){

    console.log("GET MY BILL ERROR:", error);
    res.status(500).json({message:"Server error"});

  }

};
// Payment History

export const paymentHistory = async (req,res)=>{

 try{

  const payments = await Bill.find({ status:"paid" })
   .populate({
     path:"resident",
     populate:[
       { path:"userId", select:"name" },
       { path:"room", select:"roomNumber" }
     ]
   })
   .sort({ paymentDate:-1 });

  res.status(200).json(payments);

 }catch(error){

  console.log(error);

  res.status(500).json({
   message:"Error fetching payments"
  });

 }

};

// Revenue Report

export const revenueReport = async (req,res)=>{
 try{

  const totalRevenue = await Bill.aggregate([
   { $match:{ status:"paid" } },
   { $group:{ _id:null,total:{ $sum:"$total" } } }
  ]);

  const paidBills = await Bill.countDocuments({
   status:"paid"
  });

  const pendingBills = await Bill.countDocuments({
   status:{ $ne:"paid" }
  });

  const monthlyRevenue = await Bill.aggregate([
   { $match:{ status:"paid" } },
   {
    $group:{
     _id:"$month",
     revenue:{ $sum:"$total" }
    }
   },
   { $sort:{ _id:1 } }
  ]);

  const thisMonthRevenue = await Bill.aggregate([
   {
    $match:{
     status:"paid",
     month:new Date().toISOString().slice(0,7)
    }
   },
   {
    $group:{
     _id:null,
     total:{ $sum:"$total" }
    }
   }
  ]);

  res.status(200).json({
   totalRevenue: totalRevenue[0]?.total || 0,
   paidBills,
   pendingBills,
   monthlyRevenue,
   thisMonthRevenue:thisMonthRevenue[0]?.total || 0
  });

 }catch(error){

  res.status(500).json({
   message:"Error fetching report"
  });

 }
};

// Razorpay → Create Order
export const createOrder = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    const options = {
      amount: bill.total * 100,
      currency: "INR",
      receipt: bill._id.toString(),

      notes: {
        billId: bill._id.toString(),
        residentId: bill.resident.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    bill.receipt = order.id;
    await bill.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Creating Order" });
  }
};

// Razorpay → Verify Payment

export const verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // find bill using order id
    const bill = await Bill.findOne({ receipt: razorpay_order_id });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.status = "paid";
    bill.paymentDate = new Date();

    await bill.save();

    await Payment.create({
      residentId: bill.resident,
      billId: bill._id,
      amount: bill.total,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "Success",
      method: "Razorpay"
    });

    res.status(200).json({
      message: "Payment verified and stored"
    });

  } catch (error) {

    console.log("VERIFY PAYMENT ERROR:", error);

    res.status(500).json({
      message: "Payment verification error"
    });

  }
};

//Generate Invoice

export const generateInvoice = async (req, res) => {
  try {

    const bill = await Bill.findById(req.params.id)
      .populate({
        path: "resident",
        populate: {
          path: "room",
          select: "roomNumber"
        }
      });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${bill._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(res);

    doc.font("Courier");

    doc.fontSize(20).text("HOSTEL INVOICE", { align: "center" });

    doc.moveDown(2);

    doc.fontSize(12);

    doc.text(`Resident Phone: ${bill.resident?.phone || "-"}`);

    doc.text(`Room Number: ${bill.resident?.room?.roomNumber || "-"}`);

    doc.text(`Month: ${bill.month}`);

    doc.text(
      `Payment Date: ${
        bill.paymentDate
          ? new Date(bill.paymentDate).toLocaleDateString()
          : "-"
      }`
    );

    doc.moveDown(2);

    doc.fontSize(14).text("Bill Details");

    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    const left = 60;
    const right = 450;

    doc.fontSize(12);

    doc.text("Rent", left);
    doc.text(`₹ ${bill.rent}`, right);

    doc.moveDown();

    doc.text("Utilities", left);
    doc.text(`₹ ${bill.utilities}`, right);

    doc.moveDown();

    doc.text("Late Fee", left);
    doc.text(`₹ ${bill.lateFee}`, right);

    doc.moveDown();

    doc.text("Discount", left);
    doc.text(`₹ ${bill.discount}`, right);

    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    doc.fontSize(14).text("Total", left);
    doc.text(`₹ ${bill.total}`, right);

    doc.moveDown(2);

    doc.fontSize(12).text("Status: PAID", { align: "right" });

    doc.moveDown(3);

    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: "Invoice generation error" });

  }
};
