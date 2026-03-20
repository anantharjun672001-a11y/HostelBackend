import Room from "../models/Room.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Resident from "../models/Resident.js";

dotenv.config();

// Create Room

export const createRoom = async (req, res) => {
  try {
    const { roomNumber } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });

    if (existingRoom) {
      return res.status(400).json({ message: "Room already exists" });
    }

    const room = await Room.create(req.body);

    res.status(201).json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Creating Room" });
  }
};

//Get all Rooms

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("residents");
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Rooms" });
  }
};

//Assign Resident to Room

export const assignRoom = async (req, res) => {
  try {

    const { roomId, residentId } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room Not Found" });
    }

    let resident;

    // ADMIN / STAFF assign
    if (residentId) {
      resident = await Resident.findById(residentId);
    } 
    // RESIDENT self assign
    else {
      const userId = req.user.id || req.user._id;
      resident = await Resident.findOne({ userId });
    }

    if (!resident) {
      return res.status(404).json({ message: "Resident Not Found" });
    }

    if (resident.room) {
      return res.status(400).json({ message: "Resident already has a room" });
    }

    if (room.occupied >= room.capacity) {
      return res.status(400).json({ message: "Room is Full" });
    }

    room.residents.push(resident._id);
    room.occupied += 1;

    resident.room = roomId;

    await room.save();
    await resident.save();

    res.status(200).json({
      message: "Room Assigned Successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: "Error Assigning Room" });

  }
};


// Vacate Room

export const vacateRoom = async (req, res) => {
  try {
    const { residentId } = req.body;

    const resident = await Resident.findById(residentId);

    if (!resident) {
      return res.status(404).json({ message: "Resident Not Found" });
    }

    if (!resident.room) {
      return res.status(400).json({ message: "Resident has no room" });
    }

    const room = await Room.findById(resident.room);

    if (!room) {
      return res.status(404).json({ message: "Room Not Found" });
    }

    room.residents.pull(residentId);

    if (room.occupied > 0) {
      room.occupied -= 1;
    }

    await room.save();

    resident.room = null;
    resident.checkOut = new Date();

    await resident.save();

    res.status(200).json({
      message: "Room vacated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error vacating room" });
  }
};

//Room Availability

export const getAvailableRooms = async (req, res) => {
  try {
    const availableRooms = await Room.find({
      $expr: { $lt: ["$occupied", "$capacity"] },
    }).sort({ occupied: 1 });
    res.status(200).json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available rooms" });
  }
};
