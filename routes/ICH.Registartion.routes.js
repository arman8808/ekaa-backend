const express = require("express");
const router = express.Router();
const ichRegistrationController = require("../controllers/ICH.Registartion.controller");
const { ichRegistrationUpload } = require("../config/ichMulter");
router.post(
  "/ich-registration",
  ichRegistrationUpload,
  ichRegistrationController.submitICHRegistration
);

module.exports = router;
