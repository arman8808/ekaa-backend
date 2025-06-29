const dotenv = require("dotenv");
const registrationRoutes = require("./routes/registration");
const familyConsiltalition = require("./routes/family.consitalation.registration.routes");
const ich = require("./routes/ICH.Registartion.routes");
const contactRoutes = require("./routes/contact");
const adminRoutes = require('./routes/adminRoutes');
dotenv.config();

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(`/api/registration`, registrationRoutes);
app.use(`/api/familyConsitalation`, familyConsiltalition);
app.use(`/api/ich`, ich);
app.use(`/api/`, contactRoutes);
app.use('/api/admin', adminRoutes);
app.get("/", (req, res) => {
  console.log("server is running");
  res.status(200).json({ message: "Server is running" });
});

module.exports = app;
