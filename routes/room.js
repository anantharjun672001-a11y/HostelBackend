import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  assignRoom,
  createRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomById,
  getRooms,
  updateRoom,
  vacateRoom
} from "../controllers/roomController.js";

const router = express.Router();

// Create room
router.post("/create", verifyToken, allowRoles("admin","staff"), createRoom);

// Get all rooms
router.get("/", verifyToken, getRooms);

// Assign room 
router.post("/assign", verifyToken, assignRoom);

// Vacate room 
router.post("/vacate", verifyToken, vacateRoom);

// Resident
router.get("/available", verifyToken, getAvailableRooms);

// Get room by id
router.get("/:id", verifyToken, getRoomById);

// Update room
router.put("/:id", verifyToken, allowRoles("admin","staff"), updateRoom);

// Delete room
router.delete("/:id", verifyToken, allowRoles("admin","staff"), deleteRoom);

export default router;