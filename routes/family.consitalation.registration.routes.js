const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/family.consitalation.registration.controller');

router.post('/register', registrationController.createRegistration);

module.exports = router;