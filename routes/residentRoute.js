import express from "express";
import {
  createResident,
  deleteResident,
  getMyRoom,
  getResident,
  getResidentById,
  updateResident
} from "../controllers/residentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin creates resident
router.post("/", verifyToken, allowRoles("admin"), createResident);

// Delete resident (admin/staff)
router.delete("/:id", verifyToken, allowRoles("admin","staff"), deleteResident);

// Get all residents (admin/staff)
router.get("/", verifyToken, allowRoles("admin","staff"), getResident);

// Get own room
router.get("/my-room", verifyToken, getMyRoom);

// Get resident by ID (admin/staff only)
router.get("/:id", verifyToken, allowRoles("admin","staff"), getResidentById);

// Update resident 
router.put("/:id", verifyToken, updateResident);

export default router;