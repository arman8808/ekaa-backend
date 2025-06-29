const express = require("express");
const router = express.Router();
const ichRegistrationController = require("../controllers/ICH.Registartion.controller");
const { ichRegistrationUpload } = require("../config/ichMulter");
router.post(
  "/ich-registration",
  ichRegistrationUpload,
  ichRegistrationController.submitICHRegistration
);

router.get('/', ichRegistrationController.getAllICHRegistrations);

// GET: Get a single ICH registration by ID
router.get('/:id', ichRegistrationController.getOneICHRegistration);
module.exports = router;
