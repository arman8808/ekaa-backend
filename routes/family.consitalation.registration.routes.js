const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/family.consitalation.registration.controller');

router.get('/', registrationController.getAllRegistrations);
router.post('/register', registrationController.createRegistration);

// GET: Get a single ICH registration by ID
router.get('/:id', registrationController.getRegistrationById);
module.exports = router;