const express = require("express");
const router = express.Router();
const ichRegistrationController = require("../controllers/ICH.Registartion.controller");
const multer = require("multer");
const upload = multer();

router.post(
  "/ich-registration",
  upload.none(),
  ichRegistrationController.submitICHRegistration
);

router.get("/", ichRegistrationController.getAllICHRegistrations);
router.get(
  "/download-csv",
  ichRegistrationController.downloadICHRegistrationsCSV
);
router.get("/:id", ichRegistrationController.getOneICHRegistration);
router.delete("/:id", ichRegistrationController.deleteICHRegistration);
module.exports = router;
