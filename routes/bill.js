import express from "express";
import { allowRoles, verifyToken } from "../middleware/authMiddleware.js";
import { createBill, createOrder, generateInvoice, getBills, getMyBill, paymentHistory, revenueReport, verifyPayment } from "../controllers/billController.js";



const router = express.Router();


router.post("/",verifyToken,allowRoles("admin"),createBill);

router.get("/",verifyToken,allowRoles("admin"),getBills);

router.get("/my",verifyToken,allowRoles("resident"),getMyBill);


router.get("/history",verifyToken,allowRoles("admin","resident"),paymentHistory);

router.get("/report",verifyToken,allowRoles("admin"),revenueReport);

router.post("/order/:id",verifyToken,allowRoles("resident"),createOrder);

router.post("/verify-payment", verifyPayment);

router.get("/invoice/:id",verifyToken,allowRoles("admin","resident"),generateInvoice);


export default router;