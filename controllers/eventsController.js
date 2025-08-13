const FamilyEvent = require('../models/familyEvent');
const HypnotherapyProgram = require('../models/HypnotherapyProgram');
const DecodeProgram = require('../models/decodeProgram');

// Helper function to parse date string to Date object
const parseEventDate = (dateStr) => {
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  
  const parts = dateStr.split(' ');
  const month = months[parts[0]];
  const day = parseInt(parts[1].replace(',', ''));
  const year = parseInt(parts[2]);
  
  return new Date(year, month, day);
};

// Get all open events (future dates only)
exports.getOpenEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // 1. Get Family Events
    const familyEvents = await FamilyEvent.find({ status: 'Open' });
    const validFamilyEvents = familyEvents.filter(event => {
      const eventDate = parseEventDate(event.date);
      return eventDate >= today;
    });

    // 2. Get Hypnotherapy Events
    const hypnoPrograms = await HypnotherapyProgram.find({ status: 'Open' });
    const validHypnoEvents = hypnoPrograms.flatMap(program => {
      return program.upcomingEvents
        .filter(event => {
          const eventDate = parseEventDate(event.date);
          return eventDate >= today;
        })
        .map(event => ({
          ...event.toObject(),
          programTitle: program.title,
          programType: 'hypnotherapy'
        }));
    });

    // 3. Get Decode Events
    const decodePrograms = await DecodeProgram.find({ status: 'Open' });
    const validDecodeEvents = decodePrograms.flatMap(program => {
      return program.upcomingEvents
        .filter(event => {
          const eventDate = parseEventDate(event.date);
          return eventDate >= today;
        })
        .map(event => ({
          ...event.toObject(),
          programTitle: program.title,
          programType: 'decode'
        }));
    });

    // Combine all events
    const allEvents = [
      ...validFamilyEvents.map(event => ({
        ...event.toObject(),
        programType: 'family'
      })),
      ...validHypnoEvents,
      ...validDecodeEvents
    ];

    // Sort events by date (ascending)
    allEvents.sort((a, b) => {
      const dateA = parseEventDate(a.date);
      const dateB = parseEventDate(b.date);
      return dateA - dateB;
    });

    res.json(allEvents);
  } catch (error) {
    console.error('Error fetching open events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};