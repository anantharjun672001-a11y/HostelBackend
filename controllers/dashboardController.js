import Bill from "../models/Bill.js";
import Resident from "../models/Resident.js";
import Maintenance from "../models/Maintenance.js";
import Room from "../models/Room.js";


export const getDashboardData = async (req, res) => {
  try {
    const revenueData = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0].revenue : 0;

    const residents = await Resident.countDocuments();

    const rooms = await Room.find();
    const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupied = rooms.reduce((acc, room) => acc + room.occupied, 0);

    const pendingMaintenance = await Maintenance.countDocuments({
      status: "pending",
    });

    res.json({
      revenue,
      totalResidents: residents,
      totalCapacity,
      occupied,
      pendingMaintenance,
    });
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Dashboard Data" });
  }
};
