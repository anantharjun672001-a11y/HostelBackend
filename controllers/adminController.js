import User from "../models/User.js";
import Resident from "../models/Resident.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "resident"
    });

    res.status(201).json({
      message: "Resident user created successfully",
      user
    });

  } catch (error) {

    console.log("CREATE USER ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};


//Create Staff

export const createStaff = async (req, res) => {

 try {

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
   return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const staff = await User.create({
   name,
   email,
   password: hashed,
   role: "staff",
  });

  res.status(201).json({
   message: "Staff created successfully",
   staff,
  });

 } catch (error) {

  console.log(error);
  console.log("FULL ERROR:", error);
  console.log("SERVER RESPONSE:", error.response);
  res.status(500).json({ message: "Server error" });

 }

};