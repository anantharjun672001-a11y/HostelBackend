import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  assignMaintenance,
  createMaintenance,
  getMaintenance,
  getMyMaintenance,
  getPendingMaintenance,
  updateStatus
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("resident"), createMaintenance);

router.get("/my", verifyToken, allowRoles("resident"), getMyMaintenance);

router.get("/", verifyToken, allowRoles("admin", "staff"), getMaintenance);

router.get("/pending", verifyToken, allowRoles("admin", "staff"), getPendingMaintenance);

router.put("/assign/:id", verifyToken, allowRoles("admin"), assignMaintenance);

router.put("/status/:id", verifyToken, allowRoles("admin", "staff"), updateStatus);

export default router;