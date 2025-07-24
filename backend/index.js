require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/profileRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const socialRoutes = require("./src/routes/socialRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const notificationsRouter = require("./src/routes/notificationsRoute");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(complaintRoutes);
app.use(socialRoutes);
app.use(searchRoutes);
app.use(notificationsRouter);


app.use("/uploads", express.static("uploads"));
app.use(
  "/uploads/complaints/images",
  express.static(path.join(__dirname, "uploads/complaints/images"))
);
app.use(
  "/uploads/complaints/videos",
  express.static(path.join(__dirname, "uploads/complaints/videos"))
);
app.use(
  "/uploads/complaints/audios",
  express.static(path.join(__dirname, "uploads/complaints/audios"))
);
app.use(
  "/uploads/complaints/documents",
  express.static(path.join(__dirname, "uploads/complaints/documents"))
);
app.use(
  "/uploads/complaints/others",
  express.static(path.join(__dirname, "uploads/complaints/others"))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
