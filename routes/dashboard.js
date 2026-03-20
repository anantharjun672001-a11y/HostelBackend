import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { verifyToken, allowRoles } from "../middleware/authMiddleware.js";


const router = express.Router();


router.get("/",verifyToken,allowRoles("admin"),getDashboardData);



export default router;