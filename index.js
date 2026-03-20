import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import residentRoutes from "./routes/residentRoute.js";
import roomRoutes from "./routes/room.js";
import maintenanceRoutes from "./routes/maintenance.js";
import billRoutes from "./routes/bill.js";
import paymentRoutes from "./routes/payment.js";
import dashboardRoutes from "./routes/dashboard.js"
import notificationRoutes from "./routes/notification.js"
import adminRoutes from "./routes/adminRoute.js"

dotenv.config();

const app = express();

app.use("/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://hostel-frontend-topaz.vercel.app"
  ],
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/resident", residentRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/maintenance",maintenanceRoutes);
app.use("/api/bill",billRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/notification",notificationRoutes);


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
    /* console.log("Mongo URL:", process.env.MONGO_URL); */
app.get("/", (req, res) => {
  res.send("Hostel API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));