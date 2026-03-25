import express from "express";
import { payRent, razorpayWebhook } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";



const router = express.Router();

router.post("/webhook", razorpayWebhook);
router.post("/pay",verifyToken,payRent);



export default router;