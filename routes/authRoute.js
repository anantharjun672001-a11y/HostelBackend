import express from "express";
import {
  getResidentUsers,
  getStaffUsers,
  login,
  register
} from "../controllers/auth.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

router.get(
  "/residents",
  verifyToken,
  allowRoles("admin"),
  getResidentUsers
);

router.get(
  "/staff",
  verifyToken,
  allowRoles("admin"),
  getStaffUsers
);

export default router;