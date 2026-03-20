import express from "express"
import {  verifyToken } from "../middleware/authMiddleware.js";
import { getMyNotifications, markAsRead } from "../controllers/notificationController.js";




const router = express.Router();


router.get("/",verifyToken,getMyNotifications);
router.put("/:id",verifyToken,markAsRead);



export default router

