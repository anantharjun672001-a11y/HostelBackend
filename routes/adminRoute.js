import express from "express";
import {createStaff, createUser} from "../controllers/adminController.js";


const router = express.Router();

router.post("/create-user",createUser);
router.post("/create-staff",createStaff);

export default router;