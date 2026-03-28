import Bill from "../models/Bill.js";
import Payment from "../models/Payment.js";
import Resident from "../models/Resident.js";
import Room from "../models/Room.js";

export const finalizeBillPayment = async ({
  billId,
  paymentId,
  orderId,
  method = "Razorpay",
  paymentDate = new Date(),
}) => {
  const bill = await Bill.findById(billId);

  if (!bill) {
    return { ok: false, code: "BILL_NOT_FOUND" };
  }

  if (bill.status !== "paid") {
    bill.status = "paid";
    bill.paymentDate = paymentDate;
    await bill.save();
  }

  const existingPayment = await Payment.findOne({
    $or: [{ paymentId }, { billId: bill._id, orderId }],
  });

  if (!existingPayment) {
    await Payment.create({
      residentId: bill.resident,
      billId: bill._id,
      amount: bill.total,
      paymentId,
      orderId,
      status: "Success",
      method,
    });
  }

  const resident = await Resident.findById(bill.resident);
  const room = bill.room ? await Room.findById(bill.room) : null;

  if (resident && room) {
    resident.room = room._id;
    resident.hasPaidAdvance = true;
    await resident.save();

    const alreadyAssigned = room.residents.some(
      (residentId) => residentId.toString() === resident._id.toString(),
    );

    if (!alreadyAssigned) {
      room.residents.push(resident._id);
    }

    room.occupied = room.residents.length;
    await room.save();
  }

  return { ok: true, bill };
};
