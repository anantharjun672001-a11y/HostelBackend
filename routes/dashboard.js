import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();


router.get("/",verifyToken,allowRoles("admin"),getDashboardData);



export default router;