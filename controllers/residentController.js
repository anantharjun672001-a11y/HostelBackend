import Resident from "../models/Resident.js";
import bcrpt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Create Resident

export const createResident = async (req, res) => {
  try {

    const { userId, phone, emergencyContact, address, checkIn, checkOut } = req.body;

    
    const existingResident = await Resident.findOne({ userId });

    if (existingResident) {
      return res.status(400).json({ message: "Resident profile already exists for this user" });
    }

    const resident = await Resident.create({
      userId,
      phone,
      emergencyContact,
      address,
      checkIn,
      checkOut
    });

    res.status(201).json(resident);

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: "Error Creating Resident" });

  }
};

//Get Residents

export const getResident = async (req, res) => {
  try {
    const residents = await Resident.find().populate("userId", "name").populate("room","roomNumber");

    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching residents" });
  }
};


//Get Resident By Id

export const getResidentById = async (req,res)=>{
  try{

    const resident = await Resident.findById(req.params.id)
      .populate("userId","name");

    res.json(resident);

  }catch(error){

    res.status(500).json({message:"Error fetching resident"});

  }
}

// Update Resident

export const updateResident = async (req,res)=>{
  try{

    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new:true }
    );

    res.json(resident);

  }catch(error){

    res.status(500).json({message:"Error updating resident"});

  }
}
// Get My Room (Resident)

export const getMyRoom = async (req, res) => {

  try {

    const userId = req.user.id || req.user._id;

    const resident = await Resident
      .findOne({ userId })
      .populate("room");

    if (!resident || !resident.room) {
      return res.status(404).json({
        message: "No room assigned",
      });
    }

    res.status(200).json(resident);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error fetching room",
    });

  }

};