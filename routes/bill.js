import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  createBill,
  createOrder,
  generateInvoice,
  getBills,
  getMyBill,
  paymentHistory,
  revenueReport,
  verifyPayment
} from "../controllers/billController.js";

const router = express.Router();

// Create bill (Admin only)
router.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  createBill
);

// Get all bills (Admin only)
router.get(
  "/",
  verifyToken,
  allowRoles("admin"),
  getBills
);

// Get logged-in resident bill
router.get(
  "/my",
  verifyToken,
  allowRoles("resident"),
  getMyBill
);

// Payment history (Admin + Resident)
router.get(
  "/history",
  verifyToken,
  allowRoles("admin", "resident"),
  paymentHistory
);

// Revenue report (Admin only)
router.get(
  "/report",
  verifyToken,
  allowRoles("admin"),
  revenueReport
);

// Create order (Resident only)
router.post(
  "/order/:id",
  verifyToken,
  allowRoles("resident"),
  createOrder
);

//  Verify payment 
router.post(
  "/verify-payment",
  verifyToken,
  allowRoles("resident"),
  verifyPayment
);

// Generate invoice (Admin + Resident)
router.get(
  "/invoice/:id",
  verifyToken,
  allowRoles("admin", "resident"),
  generateInvoice
);

export default router;