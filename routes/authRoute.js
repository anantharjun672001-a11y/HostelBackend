import express from "express";
import { getResidentUsers, getStaffUsers, login } from "../controllers/auth.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();


router.post("/login",login);
router.get("/residents", verifyToken, getResidentUsers);
router.get("/staff", verifyToken, getStaffUsers);

export default router;