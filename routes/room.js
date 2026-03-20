import express from "express";
import { verifyToken , allowRoles } from "../middleware/authMiddleware.js";
import { assignRoom, createRoom, getAvailableRooms, getRooms, vacateRoom } from "../controllers/roomController.js";


const router = express.Router();

router.post("/create", verifyToken, allowRoles("admin","staff"), createRoom);
router.get("/",verifyToken,getRooms);
router.post("/assign",verifyToken,assignRoom);
router.post("/vacate",verifyToken,vacateRoom);
router.get("/available",getAvailableRooms);



export default router;