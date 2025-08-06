
const asyncHandler = require('express-async-handler');
const familyEvent = require('../models/familyEvent');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;
  
  let query = {};
  
  if (search) {
    query = {
      $or: [
        { location: { $regex: search, $options: 'i' } },
        { organisedby: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { date: { $regex: search, $options: 'i' } }
      ]
    };
  }
  
  const events = await familyEvent.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
  const count = await familyEvent.countDocuments(query);
  
  res.json({
    events,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalEvents: count
  });
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const {
    date,
    location,
    capacity,
    organisedby,
    organiserEmail,
    price,
    paymentLink,
    status
  } = req.body;
  
  const event = await familyEvent.create({
    event: 'Family Constellation',
    date,
    location,
    capacity,
    organisedby,
    organiserEmail,
    price,
    paymentLink,
    status
  });
  
  res.status(201).json(event);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await familyEvent.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  const updatedEvent = await familyEvent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await familyEvent.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  await event.remove();
  
  res.json({ message: 'Event removed' });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await familyEvent.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  res.json(event);
});

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent
};