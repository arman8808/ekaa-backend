// const dotenv = require('dotenv')
// dotenv.config()

// const express = require('express')
// const app = express()
// const cors = require('cors')
// const registrationRoutes = require('./routes/registration')

// app.use(cors())
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))

// app.use('/api/registration', registrationRoutes)

// module.exports = app;

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// Import your routes
const registrationRoutes = require("./routes/registration");
const contactRoutes = require("./routes/contact");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Base API URL
const BASE_API_URL = "/api";

// Use base URL for all routes
app.use(`${BASE_API_URL}/registration`, registrationRoutes);
app.use(`${BASE_API_URL}`, contactRoutes);
app.get("/", (req, res) =>
  res.status(200).json({ message: "Server is running" })
);

module.exports = app;
