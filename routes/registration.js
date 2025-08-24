const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const multer = require('multer');

// Configure multer to handle FormData without file uploads
const upload = multer();

router.post('/', upload.none(), registrationController.createRegistration);

router.get('/', registrationController.getRegistrations);
router.get('/event/:eventId', registrationController.getRegistrationsByEvent);

module.exports = router; 