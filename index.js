import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cloudinary from "cloudinary";
import fileUpload from "express-fileupload";
import authRoutes from "./routes/authRoute.js";
import residentRoutes from "./routes/residentRoute.js";
import roomRoutes from "./routes/room.js";
import maintenanceRoutes from "./routes/maintenance.js";
import billRoutes from "./routes/bill.js";
import paymentRoutes from "./routes/payment.js";
import dashboardRoutes from "./routes/dashboard.js";
import notificationRoutes from "./routes/notification.js";
import adminRoutes from "./routes/adminRoute.js";

dotenv.config();

const app = express();


app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// Middlewares
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hostel-frontend-topaz.vercel.app",
    ],
    credentials: true,
  })
);

// CLOUDINARY CONFIG 
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// IMAGE UPLOAD ROUTE 
app.post("/api/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.image;

    const result = await cloudinary.v2.uploader.upload(
      file.tempFilePath
    );

    res.json({ url: result.secure_url });
  } catch (error) {
    console.log("UPLOAD ERROR FULL:", error);
    console.log("MESSAGE:", error.message);
  }
});

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notification", notificationRoutes);

// DB CONNECT
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hostel API Running 🚀");
});

// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);