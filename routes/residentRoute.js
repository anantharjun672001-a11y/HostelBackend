import express from "express";
import { createResident, deleteResident, getMyRoom, getResident, getResidentById,updateResident } from "../controllers/residentController.js";
import {  allowRoles, verifyToken } from "../middleware/authMiddleware.js";



const router = express.Router();

router.delete("/:id", verifyToken, allowRoles("admin","staff"), deleteResident);
router.post("/",verifyToken,createResident);
router.get("/",verifyToken,allowRoles("admin","staff"),getResident);
router.get("/my-room", verifyToken, getMyRoom);
router.get("/:id", verifyToken, getResidentById);
router.put("/:id", verifyToken, updateResident);







export default router;