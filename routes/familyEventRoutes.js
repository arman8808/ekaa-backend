const express = require('express');
const router = express.Router();
const eventController = require('../controllers/familyEvent.controller');
const { protect } = require('../middlewares/auth');

// User routes (filtered - no expired events) - MUST come before /:id routes
router.get('/user', eventController.getEventsForUsers);
router.get('/user/:id', eventController.getEventForUsers);

// Admin routes with ID parameters - MUST come after specific routes
router.route('/')
  .get(eventController.getEvents)
  .post(protect, eventController.createEvent);

router.route('/:id')
  .get(eventController.getEvent)
  .put(protect, eventController.updateEvent)
  .delete(protect, eventController.deleteEvent);

module.exports = router;