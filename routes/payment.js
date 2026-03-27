import express from "express";
import {
  createOrder,
  
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/* router.post("/webhook", razorpayWebhook); */
router.post("/create-order", verifyToken, createOrder);

export default router;